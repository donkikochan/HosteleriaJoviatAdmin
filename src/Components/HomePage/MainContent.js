import React from "react";
import { Box, Heading, Image, VStack, Button } from "@chakra-ui/react";
import { Link } from "wouter";
const MainContent = () => {
  const logo = require("../Nav/logo.png");
  return (
    <Box>
      <VStack bg={"white"} width={"100%"} minHeight={"100vh"} pt={150}>
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
        <Link to="/carrega-alumnes">
          <Button colorScheme="blue" mt={18}>
            Carregar alumnes
          </Button>
        </Link>
        <Link to="/carrega-alumnes">
          <Button colorScheme="blue" mt={18} mb={18}>
            Carregar restaurants
          </Button>
        </Link>
      </VStack>
    </Box>
  );
};

export default MainContent;
