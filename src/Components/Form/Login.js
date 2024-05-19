import React, { useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Box,
  Heading,
  InputGroup,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useLocation } from "wouter";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { app } from "../../firebaseConfig";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const [location, navigate] = useLocation();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleShowClick = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth(app);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/home"); // Redirige a la página principal o la página deseada después del inicio de sesión
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleForgotPassword = async () => {
    const auth = getAuth(app);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un correo para restablecer tu contraseña.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <VStack bg={"white"} width={"100%"} pt={150}>
        <Heading
          as="h1"
          fontFamily="'Hanken Grotesk', Arial, sans-serif"
          size="xl"
          w={{ base: "200", md: "600" }}
          maxW={600}
          mb={5}
          textAlign={"center"}
        >
          Iniciar Sesión
        </Heading>
      </VStack>
      <VStack
        as="form"
        onSubmit={handleSubmit}
        spacing={5}
        maxW={600}
        mx="auto"
      >
        <FormControl isRequired>
          <FormLabel>Correo Electrónico</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Correo Electrónico"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Contraseña</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Contraseña"
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleShowClick}>
                {showPassword ? <ViewOffIcon /> : <ViewIcon />}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button colorScheme="blue" type="submit">
          Iniciar Sesión
        </Button>
        <Button variant="link" onClick={handleForgotPassword}>
          ¿Olvidaste tu contraseña?
        </Button>
      </VStack>
    </Box>
  );
};

export default LoginForm;
