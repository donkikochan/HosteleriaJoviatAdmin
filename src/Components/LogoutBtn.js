import { Button } from "@chakra-ui/react"

const LogoutBtn = ({ width }) => {
  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  return (
    <Button colorScheme="red" width={width} onClick={handleLogout}>
      Logout
    </Button>
  )
}

export default LogoutBtn

