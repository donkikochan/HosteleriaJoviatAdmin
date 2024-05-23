import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  VStack,
  Box,
  Heading,
  Select,
  Checkbox,
} from "@chakra-ui/react";
import { useLocation } from "wouter";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

import {
  getFirestore,
  setDoc,
  doc,
  collection,
  getDocs,
  getDoc,
} from "@firebase/firestore";
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
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([
    {
      userId: "",
      responsabilitat: "",
      propietari: false,
      anydeinici: "",
      imageUrl: "",
    },
  ]);
  const [responsabilitat, setResponsabilitat] = useState("");
  const [propietari, setPropietari] = useState(false);
  const [anydeinici, setAnydeinici] = useState("");
  const [userInstagram, setUserInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [mobil, setMobil] = useState("");
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
    selectedUser: false,
    responsabilitat: false,
    propietari: false,
    anydeinici: false,
  });
  const [location, navigate] = useLocation();

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore(app);
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersData);
    };

    fetchUsers();
  }, []);

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

  const removeFotoInput = (index) => {
    setFotos((prevFotos) => prevFotos.filter((_, i) => i !== index));
  };

  const addNewWorker = () => {
    setSelectedUsers((prevUsers) => [
      ...prevUsers,
      {
        userId: "",
        responsabilitat: "",
        propietari: false,
        anydeinici: "",
      },
    ]);
  };

  const removeWorker = (index) => {
    setSelectedUsers((prevUsers) => prevUsers.filter((_, i) => i !== index));
  };

  const handleDireccioChange = (e) => {
    setDireccio(e.target.value);
  };
  const handleDescripcioChange = (e) => {
    setDescripcio(e.target.value);
  };
  const handlePropietariChange = (e) => {
    setPropietari(e.target.checked);
  };
  const handleUserChange = (index, field, value) => {
    setSelectedUsers((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleBlur = (field) => {
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      [field]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convertir y validar longitud y latitud
    const numLongitud = parseFloat(longitud);
    const numLatitud = parseFloat(latitud);
    if (isNaN(numLongitud) || isNaN(numLatitud)) {
      alert("La longitud y la latitud deben ser números válidos.");
      return;
    }

    // Verificación de campos requeridos
    const requiredFields = [nom, tel, web, instagram, direccio, descripcio];
    if (requiredFields.some((field) => !field) || foto.every((f) => !f)) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    if (
      selectedUsers.some(
        (user) => !user.userId || !user.anydeinici || !user.responsabilitat
      )
    ) {
      alert("Por favor, completa todos los detalles de los treballadors.");
      return;
    }

    try {
      const db = getFirestore(app);
      const newRestaurantRef = doc(collection(db, "Restaurant"));
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

      // Guardar datos del restaurante
      await setDoc(newRestaurantRef, restaurantData);

      // Guardar datos de los treballadors
      for (const user of selectedUsers) {
        const userSnap = await getDoc(doc(db, "users", user.userId));
        if (userSnap.exists()) {
          const userData = userSnap.data();

          const alumnesRef = collection(
            db,
            "Restaurant",
            newRestaurantRef.id,
            "alumnes"
          );

          const alumneData = {
            nom: `${userData.nom} ${userData.cognom}`,
            image: userData.imageUrl,
            correu: userData.email,
            responsabilitat: user.responsabilitat,
            propietari: user.propietari,
            anydeinici: user.anydeinici,
          };

          // Incluir campos opcionales solo si existen y no son vacíos
          if (userData.instagram) alumneData.instagram = userData.instagram;
          if (userData.linkedin) alumneData.linkedin = userData.linkedin;
          if (userData.mobile) alumneData.mobil = userData.mobile;

          await setDoc(doc(alumnesRef), alumneData);
        }
      }

      console.log("Restaurante creado con éxito.");
      navigate("/success-restaurant");
    } catch (error) {
      console.error("Error al crear el restaurante:", error);
      alert("Error al crear el restaurante: " + error.message);
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
        <FormControl maxW={600} isRequired>
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
        </FormControl>

        <FormControl maxW={600} isRequired>
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
        </FormControl>

        <FormControl maxW={600} isRequired>
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
        </FormControl>

        <FormControl maxW={600} isRequired>
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
        </FormControl>

        <FormControl maxW={600} isRequired>
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
        </FormControl>

        <FormControl maxW={600} isRequired>
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
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Fotos</FormLabel>
          {foto.map((url, index) => (
            <Box key={index} position="relative">
              <Input
                type="text"
                value={url}
                onChange={(e) => handleFotosChange(index, e.target.value)}
                placeholder="URL de la foto"
                onBlur={() => handleBlur("foto")}
                isInvalid={touchedFields.foto && !url}
              />

              <Button
                position={"absolute"}
                right={0}
                colorScheme="red"
                onClick={() => removeFotoInput(index)}
              >
                <DeleteIcon />
              </Button>
            </Box>
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
            color={touchedFields.foto && foto.every((f) => !f) ? "red" : "gray"}
          >
            Introdueix les URLs de les fotos del restaurant.
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
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
        </FormControl>

        <FormControl maxW={600} isRequired>
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
        </FormControl>

        <FormControl mb={5} maxW={600}>
          <Box>
            <FormLabel my={7}>Afegir treballadors</FormLabel>
            {selectedUsers.map((user, index) => (
              <Box
                key={index}
                my={5}
                px={10}
                pb={10}
                pt={5}
                boxShadow={"2px 2px 5px 0 grey"}
                borderRadius={15}
              >
                <FormControl isRequired>
                  <FormLabel mt={25}>Seleccioneu un usuari</FormLabel>
                  <Select
                    placeholder="Seleccioneu un usuari"
                    onChange={(e) =>
                      handleUserChange(index, "userId", e.target.value)
                    }
                    value={user.userId}
                  >
                    {users.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.nom + " " + option.cognom}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mt={5} isRequired>
                  <FormLabel>Any de inici</FormLabel>
                  <Input
                    placeholder="Any de inici"
                    type="text"
                    value={user.anydeinici}
                    onChange={(e) =>
                      handleUserChange(index, "anydeinici", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl mt={5} isRequired>
                  <FormLabel>Responsabilitat</FormLabel>
                  <Input
                    placeholder="Responsabilitat"
                    type="text"
                    value={user.responsabilitat}
                    onChange={(e) =>
                      handleUserChange(index, "responsabilitat", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl mt={5}>
                  <FormLabel>¿És propietari?</FormLabel>
                  <Checkbox
                    mb={10}
                    isChecked={user.propietari}
                    onChange={(e) =>
                      handleUserChange(index, "propietari", e.target.checked)
                    }
                  >
                    És propietari
                  </Checkbox>
                </FormControl>
                <Button
                  position={"absolute"}
                  right={5}
                  colorScheme="red"
                  onClick={() => removeWorker(index)}
                >
                  <DeleteIcon />
                </Button>
              </Box>
            ))}
          </Box>
          <Button colorScheme="blue" onClick={addNewWorker}>
            <AddIcon /> Afegir més treballadors
          </Button>
        </FormControl>

        <Button mt={5} mb={20} colorScheme="blue" type="submit">
          Carregar dades
        </Button>
      </VStack>
    </Box>
  );
};

export default RestaurantsForm;
