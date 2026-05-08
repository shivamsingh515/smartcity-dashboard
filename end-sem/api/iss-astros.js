export default async function handler(req, res) {
  try {
    const response = await fetch('http://api.open-notify.org/astros.json');
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600'); 
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch astronauts' });
  }
}
