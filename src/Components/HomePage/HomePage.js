import MainContent from "./MainContent"
import Sidebar from "../Sidebar" // Corregido: Importamos desde el directorio padre
import { Box } from "@chakra-ui/react"

const HomePage = () => {
  return (
    <Sidebar>
      <Box>
        <MainContent />
      </Box>
    </Sidebar>
  )
}

export default HomePage

