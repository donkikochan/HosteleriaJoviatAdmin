import React from "react";
import { Box, VStack, Image, Heading } from "@chakra-ui/react";

const HomePage = () => {
  const logo = require("../Nav/Logo_Joviat_2023-01.png");
  return (
    <Box>
      <VStack bg={"white"} width={"100%"} minHeight={"100vh"} pt={150}>
        <Image
          src={logo}
          alt="Joviat logo"
          width={"35vw"}
          objectFit={"cover"}
          borderRadius={"full"}
        />
        <Heading
          as="h1"
          fontFamily="'Hanken Grotesk', Arial, sans-serif"
          size="4xl"
        >
          Hola Administrador!
        </Heading>
        <Heading
          as="h2"
          fontFamily="'Hanken Grotesk', Arial, sans-serif"
          size="3xl"
        >
          Benvingut a la pàgina de càrrega d'alumnes per a l'app d'Hostaleria
          JoviatApp
        </Heading>
      </VStack>
    </Box>
  );
};

export default HomePage;
