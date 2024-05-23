import { Button, useToast } from "@chakra-ui/react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../firebaseConfig";
import { useRoute, useLocation } from "wouter";

const LogoutBtn = () => {
  const auth = getAuth(app);
  const [location, navigate] = useLocation();
  const toast = useToast();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
      toast({
        title: "Logout exitoso",
        description: "Has cerrado sesion correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  return (
    <Button colorScheme="red" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutBtn;
