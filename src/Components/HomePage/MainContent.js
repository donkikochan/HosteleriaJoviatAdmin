import React from "react";
import { Box, Heading, Image, VStack, Button, HStack } from "@chakra-ui/react";
import { Link } from "wouter";
import LogoutBtn from "../Form/LogoutBtn";

const MainContent = () => {
  const logo = require("../Nav/logo.png");
  return (
    <Box>
      <VStack bg={"white"} width={"100%"} minHeight={"100vh"} py={150}>
        <Image
          src={logo}
          alt="Joviat logo"
          width={"15rem"}
          objectFit={"cover"}
          borderRadius={"full"}
          mb={10}
        />
        <Heading
          as="h1"
          fontFamily="'Hanken Grotesk', Arial, sans-serif"
          size="2xl"
          w={500}
          maxW={600}
          mb={5}
          textAlign={"center"}
        >
          ¡Hola Administrador!
        </Heading>
        <Heading
          as="h2"
          fontFamily="'Hanken Grotesk', Arial, sans-serif"
          size="lg"
          w={{ base: 400, md: 800 }}
          textAlign={"center"}
        >
          Benvingut a la pàgina de càrrega d'alumnes per a l'app d'Hostaleria
          JoviatApp
        </Heading>
        <HStack>
          <Link to="/Ingressar-alumnes">
            <Button colorScheme="blue" mt={18}>
              Ingressar alumnes
            </Button>
          </Link>
          <Link to="/veure-alumnes">
            <Button colorScheme="blue" mt={18}>
              Veure alumnes
            </Button>
          </Link>
        </HStack>
        <HStack>
          <Link to="/Ingressar-restaurants">
            <Button colorScheme="blue" mt={18} mb={18}>
              Ingressar restaurants
            </Button>
          </Link>
          <Link to="/veure-restaurants">
            <Button colorScheme="blue" mt={18} mb={18}>
              Veure restaurants
            </Button>
          </Link>
          <Link to="/alta-usuaris">
            <Button colorScheme="blue" mt={18} mb={18}>
              Usuaris Alta
            </Button>
          </Link>
        </HStack>
        <LogoutBtn />
      </VStack>
    </Box>
  );
};

export default MainContent;