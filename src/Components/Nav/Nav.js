import { Box, Stack, Image } from "@chakra-ui/react";
import React from "react";

const Nav = () => {
  const logo = require("./logo.webp");
  return (
    <Box
      as="nav"
      className="navBar"
      bg="#111820"
      padding={"1rem"}
      pt={5}
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
        <Image src={logo} alt="Joviat logo" width={150} />
      </Stack>
    </Box>
  );
};

export default Nav;
