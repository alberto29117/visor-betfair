exports.handler = async function (event, context) {
  // Solo permitimos peticiones de tipo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // Extraemos los datos que nos envía el frontend (nuestro index.html)
    const { appKey, sessionToken, betfairBody } = JSON.parse(event.body);

    // Validamos que tenemos las credenciales
    if (!appKey || !sessionToken) {
      return { statusCode: 400, body: JSON.stringify({ error: 'App Key y Session Token son requeridos.' }) };
    }

    const BETFAIR_API_URL = 'https://api.betfair.com/exchange/betting/json-rpc/v1';

    // Hacemos la llamada a la API de Betfair usando el 'fetch' nativo
    const response = await fetch(BETFAIR_API_URL, {
      method: 'POST',
      headers: {
        'X-Application': appKey,
        'X-Authentication': sessionToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(betfairBody),
    });

    // Si Betfair devuelve un error, lo capturamos
    if (!response.ok) {
      const errorText = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: `Error de Betfair: ${errorText}` }) };
    }

    // Si todo va bien, devolvemos los datos a nuestro frontend
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    // Capturamos cualquier otro error
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error interno del servidor: ${error.message}` }),
    };
  }
};
