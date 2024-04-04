import { Box, Stack, Image } from "@chakra-ui/react";
import React from "react";

const Nav = () => {
  const logo = require("./logo.png");
  return (
    <Box
      as="nav"
      className="navBar"
      bg="#666666"
      padding={"1rem"}
      position={"fixed"}
      width={"100%"}
      height={"70px"}
      top={0}
      zIndex={11}
    >
      <Stack
        direction={"row"}
        spacing={4}
        align={"flex-start"}
        justify={"flex-start"}
        paddingLeft={"10vw"}
      >
        <Image
          src={logo}
          alt="Joviat logo"
          boxSize={"40px"}
          borderRadius={"full"}
        />
      </Stack>
    </Box>
  );
};

export default Nav;
