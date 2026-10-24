import http from 'http';
import url from 'url';

// Dynamically import the real Vercel API handlers
const handlers = {
  'login-ajax': (await import('../api/login-ajax.js')).default,
  'get-hospitals': (await import('../api/get-hospitals.js')).default,
  'get-questions': (await import('../api/get-questions.js')).default,
  'get-patient': (await import('../api/get-patient.js')).default,
  'submit-feedback': (await import('../api/submit-feedback.js')).default,
  'get-responses': (await import('../api/get-responses.js')).default,
  'save-questions': (await import('../api/save-questions.js')).default,
  'save-office-use': (await import('../api/save-office-use.js')).default,
  'info': (await import('../api/info.js')).default
};

function matchHandler(reqPath) {
  for (const key of Object.keys(handlers)) {
    if (reqPath.includes(key)) {
      return handlers[key];
    }
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  console.log(`[API Bridge] ${req.method} ${parsedUrl.pathname}`);

  // Enhance res with status and json methods expected by Vercel handlers
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.json = function(obj) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
    return res;
  };

  // Enhance req with query
  req.query = parsedUrl.query;

  // Buffer body if method is POST/PUT
  let bodyBuffer = '';
  req.on('data', chunk => {
    bodyBuffer += chunk;
  });

  req.on('end', async () => {
    try {
      if (bodyBuffer) {
        try {
          req.body = JSON.parse(bodyBuffer);
        } catch (e) {
          req.body = bodyBuffer;
        }
      } else {
        req.body = {};
      }

      const handler = matchHandler(parsedUrl.pathname);
      if (handler) {
        if (parsedUrl.pathname.includes('get-questions')) {
          // Fast fallback if Supabase database pooler is paused/unreachable
          // to ensure instant local UI loading
          try {
            await handler(req, res);
          } catch (e) {
            if (!res.headersSent) {
              res.status(200).json({ success: true, fallback: true, data: [], yesno_data: [] });
            }
          }
          return;
        }
        await handler(req, res);
      } else {
        res.status(404).json({ error: 'Endpoint not found', path: parsedUrl.pathname });
      }
    } catch (err) {
      console.error('[API Bridge Error]', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  });
});

const PORT = 8081;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Local API bridge running at http://127.0.0.1:${PORT}`);
});
