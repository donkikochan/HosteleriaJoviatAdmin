import express from "express"
import axios from "axios"
import cors from "cors"
import apiKeys from "../src/utils/apiKeys.js"

const { GOOGLE_CLOUD_API_KEY } = apiKeys
const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json()) // Permitir JSON en los POST

// Endpoint para la búsqueda de lugares en Google Places
app.post("/api/searchPlaces", async (req, res) => {
  try {
    const { query } = req.body
    console.log("Búsqueda recibida:", query)

    if (!query) {
      return res.status(400).json({ error: "Se requiere un término de búsqueda" })
    }

    // Realizar la llamada a Google Places Text Search API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_CLOUD_API_KEY}`,
    )

    console.log("Respuesta de Google Places recibida")
    res.json(response.data) // Devolver la respuesta de Google Places
  } catch (error) {
    console.error("Error en Google Places:", error.response ? error.response.data : error.message)
    res.status(500).json({ error: "Error en la búsqueda de Google Places" })
  }
})

// Endpoint para obtener los detalles de un lugar específico
app.get("/api/getPlaceDetails/:placeId", async (req, res) => {
  try {
    const { placeId } = req.params
    console.log("🔍 Recibiendo placeId:", placeId)

    if (!placeId) {
      return res.status(400).json({ error: "Se requiere un Place ID" })
    }

    // Realizar la llamada a Google Places Details API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_CLOUD_API_KEY}&fields=formatted_address,name,formatted_phone_number,website,place_id,types`,
    )
    console.log("api",GOOGLE_CLOUD_API_KEY);
    console.log("✅ Respuesta de Google Places:", JSON.stringify(response.data, null, 2))
    res.json(response.data)
  } catch (error) {
    console.error("❌ Error obteniendo detalles del lugar:")

    if (error.response) {
      console.error("📡 Respuesta de Google:", JSON.stringify(error.response.data, null, 2))
      return res.status(error.response.status).json({
        error: "Error al obtener detalles del lugar",
        details: error.response.data,
      })
    } else {
      console.error("⚠️ Error inesperado:", error.message)
      return res.status(500).json({ error: "Error inesperado al obtener detalles del lugar", message: error.message })
    }
  }
})

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor proxy corriendo en http://localhost:${PORT}`)
  console.log("Google Cloud API Key:", GOOGLE_CLOUD_API_KEY)
})

