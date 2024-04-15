import React, { useState } from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  VStack,
  Box,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import { useLocation } from "wouter";
import { AddIcon } from "@chakra-ui/icons";

import { getFirestore, setDoc, doc, collection } from "@firebase/firestore";
import { app } from "../../firebaseConfig";

const RestaurantsForm = () => {
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [web, setWeb] = useState("");
  const [longitud, setLongitud] = useState("");
  const [latitud, setLatitud] = useState("");
  const [instagram, setInstagram] = useState("");
  const [foto, setFotos] = useState([""]);
  const [direccio, setDireccio] = useState("");
  const [descripcio, setDescripcio] = useState("");
  const [touchedFields, setTouchedFields] = useState({
    nom: false,
    tel: false,
    web: false,
    longitud: false,
    latitud: false,
    instagram: false,
    foto: false,
    direccio: false,
    descripcio: false,
  });
  const [location, navigate] = useLocation();

  const handleNomChange = (e) => {
    setNom(e.target.value);
  };
  const handleTelChange = (e) => {
    setTel(e.target.value);
  };
  const handleWebChange = (e) => {
    setWeb(e.target.value);
  };
  const handleLongitudChange = (e) => {
    setLongitud(e.target.value);
  };
  const handleLatitudChange = (e) => {
    setLatitud(e.target.value);
  };
  const handleInstagramChange = (e) => {
    setInstagram(e.target.value);
  };
  const handleFotosChange = (index, value) => {
    const newFotos = [...foto];
    newFotos[index] = value;
    setFotos(newFotos);
  };
  const addFotoInput = () => {
    setFotos([...foto, ""]);
  };
  const handleDireccioChange = (e) => {
    setDireccio(e.target.value);
  };
  const handleDescripcioChange = (e) => {
    setDescripcio(e.target.value);
  };

  const handleBlur = (field) => {
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      [field]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convertir longitud y latitud a número
    const numLongitud = parseFloat(longitud);
    const numLatitud = parseFloat(latitud);

    // Validar que los datos numéricos sean números reales
    if (isNaN(numLongitud) || isNaN(numLatitud)) {
      alert("La longitud y la latitud deben ser números válidos.");
      return;
    }

    if (
      !nom ||
      !tel ||
      !web ||
      !numLongitud ||
      !numLatitud ||
      !instagram ||
      !foto ||
      !direccio ||
      !descripcio
    ) {
      alert("Error: Completa todos los campos obligatorios.");
    } else {
      try {
        const db = getFirestore(app);
        // Genera un nuevo ID de documento aleatorio para el restaurante
        const newRestaurantRef = doc(collection(db, "Restaurant"));

        // Preparar el objeto del restaurante para Firestore
        const restaurantData = {
          nom,
          tel,
          web,
          longitud: numLongitud,
          latitud: numLatitud,
          instagram,
          foto,
          direccio,
          descripcio,
        };

        await setDoc(newRestaurantRef, restaurantData);

        // Redirigir al usuario a la página de éxito
        // Verifica que estés utilizando el enrutador correcto y que "/success" sea una ruta válida en tu app
        navigate("/success-restaurant");
      } catch (error) {
        alert("Error al crear el restaurante: " + error.message);
      }
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
          ¡Ja podeu començar a carregar les dades dels restaurants!
        </Heading>
      </VStack>
      <VStack as="form" onSubmit={handleSubmit}>
        <FormControl mt={50} maxW={600} isRequired>
          <FormLabel mt={5}>Nom del restaurant</FormLabel>
          <Input
            type="text"
            value={nom}
            onChange={handleNomChange}
            onBlur={() => handleBlur("nom")}
            placeholder="Nom del restaurant"
            isInvalid={touchedFields.nom && !nom}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.nom && !nom ? "red" : "gray"}
          >
            Introdueix el nom del restaurant
          </FormHelperText>

          <FormLabel mt={5}>Telèfon</FormLabel>
          <Input
            type="text"
            value={tel}
            onChange={handleTelChange}
            onBlur={() => handleBlur("tel")}
            placeholder="Telèfon"
            isInvalid={touchedFields.tel && !tel}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.tel && !tel ? "red" : "gray"}
          >
            Introdueix el telèfon.
          </FormHelperText>

          <FormLabel mt={5}>Lloc web</FormLabel>
          <Input
            type="text"
            value={web}
            onChange={handleWebChange}
            onBlur={() => handleBlur("web")}
            placeholder="URL del lloc web"
            isInvalid={touchedFields.web && !web}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.web && !web ? "red" : "gray"}
          >
            Introdueix la url del lloc web.
          </FormHelperText>

          <FormLabel mt={5}>Longitud</FormLabel>
          <Input
            type="text"
            value={longitud}
            onChange={handleLongitudChange}
            onBlur={() => handleBlur("longitud")}
            placeholder="Longitud geográfica"
            isInvalid={touchedFields.longitud && !longitud}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.longitud && !longitud ? "red" : "gray"}
          >
            Introdueix la longitud geográfica.
          </FormHelperText>

          <FormLabel mt={5}>Latitud</FormLabel>
          <Input
            type="text"
            value={latitud}
            onChange={handleLatitudChange}
            onBlur={() => handleBlur("latitud")}
            placeholder="Latitud geográfica"
            isInvalid={touchedFields.latitud && !latitud}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.latitud && !latitud ? "red" : "gray"}
          >
            Introdueix la latitud geográfica.
          </FormHelperText>

          <FormLabel mt={5}>Instagram</FormLabel>
          <Input
            type="text"
            value={instagram}
            onChange={handleInstagramChange}
            onBlur={() => handleBlur("instagram")}
            placeholder="Instagram"
            isInvalid={touchedFields.instagram && !instagram}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.instagram && !instagram ? "red" : "gray"}
          >
            Introdueix l'instagram del restaurant.
          </FormHelperText>

          <FormLabel mt={5}>Fotos</FormLabel>
          {foto.map((url, index) => (
            <Input
              key={index}
              type="text"
              value={url}
              onChange={(e) => handleFotosChange(index, e.target.value)}
              placeholder="URL de la foto"
              onBlur={() => handleBlur("foto")}
              isInvalid={touchedFields.foto && !url}
            />
          ))}
          <Button
            onClick={() => addFotoInput()}
            colorScheme="blue"
            size="sm"
            m={2}
          >
            <AddIcon /> Afegir una altra foto
          </Button>

          <FormHelperText
            mt={1}
            color={
              touchedFields.foto && foto.some((f) => !f.url) ? "red" : "gray"
            }
          >
            Introdueix les URLs de les fotos del restaurant.
          </FormHelperText>

          <FormLabel mt={5}>Direcció</FormLabel>
          <Input
            type="text"
            value={direccio}
            onChange={handleDireccioChange}
            onBlur={() => handleBlur("direccio")}
            placeholder="Direcció"
            isInvalid={touchedFields.direccio && !direccio}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.direccio && !direccio ? "red" : "gray"}
          >
            Introdueix la direcció del restaurant.
          </FormHelperText>

          <FormLabel mt={5}>Descripció</FormLabel>
          <Input
            type="text"
            value={descripcio}
            onChange={handleDescripcioChange}
            onBlur={() => handleBlur("descripcio")}
            placeholder="Descripció"
            isInvalid={touchedFields.descripcio && !descripcio}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.descripcio && !descripcio ? "red" : "gray"}
          >
            Introdueix la descripció del restaurant.
          </FormHelperText>

          <Button mt={5} mb={20} colorScheme="blue" type="submit">
            Carregar dades
          </Button>
        </FormControl>
      </VStack>
    </Box>
  );
};

export default RestaurantsForm;
