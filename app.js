const http = require('http');
const url = require('url');
const querystring = require('querystring');

const hostname = '0.0.0.0';
const port = 3000;

const sampleData = {
  users: [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
    { id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'user' }
  ],
  products: [
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
    { id: 2, name: 'Coffee Mug', price: 12.99, category: 'Kitchen' },
    { id: 3, name: 'Notebook', price: 4.99, category: 'Office' }
  ]
};

let requestCount = 0;

function logRequest(req) {
  requestCount++;
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.url;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${path} - ${userAgent} (Request #${requestCount})`);
}

function generateHtmlPage(title, content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        nav { margin: 20px 0; padding: 10px; background: #f4f4f4; }
        nav a { margin-right: 15px; text-decoration: none; color: #007bff; }
        nav a:hover { text-decoration: underline; }
        .json-data { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .error { color: #dc3545; }
        .info { background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <nav>
        <a href="/">Inicio</a>
        <a href="/about">Acerca de</a>
        <a href="/users">Usuarios</a>
        <a href="/products">Productos</a>
        <a href="/api/users">API Usuarios</a>
        <a href="/api/products">API Productos</a>
        <a href="/stats">Estadísticas</a>
    </nav>
    ${content}
</body>
</html>`;
}

function handleApiRequest(res, data, dataType) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const response = {
    success: true,
    data: data,
    count: data.length,
    timestamp: new Date().toISOString(),
    type: dataType
  };
  
  res.end(JSON.stringify(response, null, 2));
}

function handleNotFound(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  
  const content = `
    <h1>404 - Página No Encontrada</h1>
    <p class="error">La página solicitada no se pudo encontrar.</p>
    <p>Rutas disponibles:</p>
    <ul>
        <li><a href="/">Inicio</a></li>
        <li><a href="/about">Acerca de</a></li>
        <li><a href="/users">Usuarios</a></li>
        <li><a href="/products">Productos</a></li>
        <li><a href="/api/users">API Usuarios</a></li>
        <li><a href="/api/products">API Productos</a></li>
        <li><a href="/stats">Estadísticas del Servidor</a></li>
    </ul>
  `;
  
  res.end(generateHtmlPage('404 - Página No Encontrada', content));
}

const server = http.createServer((req, res) => {
  logRequest(req);
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  try {
    switch(pathname) {
      case '/':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        
        const homeContent = `
          <h1>Servidor Demo con Node.js</h1>
          <div class="info">
            <p>Este es un servidor de demostración construido con Node.js </p>
            <p>Servidor iniciado en: ${new Date().toISOString()}</p>
            <p>Total de solicitudes manejadas: ${requestCount}</p>
          </div>
        `;
        
        res.end(generateHtmlPage('Servidor de Demostración Node.js', homeContent));
        break;
        
      case '/about':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        
        const aboutContent = `
          <h1>Acerca de Esta Demostración</h1>
          <p>Esta aplicación demuestra la containerización Docker de una aplicación Node.js.</p>
          <h2>Detalles Técnicos:</h2>
          <ul>
            <li>Runtime: Node.js ${process.version}</li>
            <li>Plataforma: ${process.platform}</li>
            <li>Arquitectura: ${process.arch}</li>
            <li>Uso de Memoria: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB</li>
            <li>Tiempo Activo: ${Math.round(process.uptime())} segundos</li>
          </ul>
          <h2>Información del Contenedor:</h2>
          <ul>
            <li>Imagen Base: node:24.10.0</li>
            <li>Directorio de Trabajo: /app</li>
            <li>Puerto Expuesto: 3000</li>
          </ul>
        `;
        
        res.end(generateHtmlPage('Acerca de', aboutContent));
        break;
        
      case '/users':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        
        let usersHtml = '<h1>Usuarios</h1><div class="json-data"><table border="1" cellpadding="10"><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th></tr>';
        sampleData.users.forEach(user => {
          usersHtml += `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.email}</td><td>${user.role}</td></tr>`;
        });
        usersHtml += '</table></div>';
        
        res.end(generateHtmlPage('Usuarios', usersHtml));
        break;
        
      case '/products':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        
        let productsHtml = '<h1>Productos</h1><div class="json-data"><table border="1" cellpadding="10"><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Categoría</th></tr>';
        sampleData.products.forEach(product => {
          productsHtml += `<tr><td>${product.id}</td><td>${product.name}</td><td>$${product.price}</td><td>${product.category}</td></tr>`;
        });
        productsHtml += '</table></div>';
        
        res.end(generateHtmlPage('Productos', productsHtml));
        break;
        
      case '/api/users':
        handleApiRequest(res, sampleData.users, 'users');
        break;
        
      case '/api/products':
        handleApiRequest(res, sampleData.products, 'products');
        break;
        
      case '/stats':
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        
        const statsContent = `
          <h1>Estadísticas del Servidor</h1>
          <div class="info">
            <h2>Información de Solicitudes:</h2>
            <p>Total de Solicitudes: ${requestCount}</p>
            <p>Tiempo Activo del Servidor: ${Math.round(process.uptime())} segundos</p>
            <p>Hora Actual: ${new Date().toISOString()}</p>
          </div>
          <div class="info">
            <h2>Información del Sistema:</h2>
            <p>Versión de Node.js: ${process.version}</p>
            <p>Plataforma: ${process.platform}</p>
            <p>Arquitectura: ${process.arch}</p>
            <p>Uso de Memoria: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB</p>
            <p>ID del Proceso: ${process.pid}</p>
          </div>
          <div class="info">
            <h2>Resumen de Datos:</h2>
            <p>Total de Usuarios: ${sampleData.users.length}</p>
            <p>Total de Productos: ${sampleData.products.length}</p>
          </div>
        `;
        
        res.end(generateHtmlPage('Estadísticas del Servidor', statsContent));
        break;
        
      default:
        handleNotFound(res);
        break;
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    
    const errorContent = `
      <h1>500 - Error Interno del Servidor</h1>
      <p class="error">Ocurrió un error al procesar su solicitud.</p>
      <p>Por favor, inténtelo de nuevo más tarde o contacte al administrador.</p>
    `;
    
    res.end(generateHtmlPage('Error del Servidor', errorContent));
  }
});

server.listen(port, hostname, () => {
  console.log(`Servidor ejecutándose en http://${hostname}:${port}/`);
  console.log(`Rutas disponibles:`);
  console.log(`  - http://${hostname}:${port}/         (Inicio)`);
  console.log(`  - http://${hostname}:${port}/about    (Acerca de)`);
  console.log(`  - http://${hostname}:${port}/users    (Lista de usuarios)`);
  console.log(`  - http://${hostname}:${port}/products (Lista de productos)`);
  console.log(`  - http://${hostname}:${port}/api/users    (API JSON de usuarios)`);
  console.log(`  - http://${hostname}:${port}/api/products (API JSON de productos)`);
  console.log(`  - http://${hostname}:${port}/stats    (Estadísticas del servidor)`);
});