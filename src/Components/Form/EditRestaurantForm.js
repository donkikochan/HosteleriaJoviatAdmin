import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Checkbox,
  Heading,
  useToast,
  Select,
  Text,
} from "@chakra-ui/react";
import {
  doc,
  getFirestore,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { app } from "../../firebaseConfig";
import { DeleteIcon } from "@chakra-ui/icons";

const EditRestaurantForm = () => {
  const [, params] = useRoute("/edit-restaurant/:id");
  const restaurantId = params.id;
  const [location, navigate] = useLocation();
  const toast = useToast();
  const [restaurant, setRestaurant] = useState({
    nom: "",
    tel: "",
    web: "",
    longitud: "",
    latitud: "",
    instagram: "",
    foto: [""],
    direccio: "",
    descripcio: "",
    users: [],
  });
  const [allUsers, setAllUsers] = useState([]);
  const [addingNewUser, setAddingNewUser] = useState(false);

  useEffect(() => {
    const db = getFirestore(app);

    const fetchAllUsers = async () => {
      const usersCollectionRef = collection(db, "users");
      const userSnapshots = await getDocs(usersCollectionRef);
      const usersData = userSnapshots.docs.map((doc) => ({
        id: doc.id,
        nom: doc.data().nom,
        cognom: doc.data().cognom,
      }));
      setAllUsers(usersData);
    };

    const fetchRestaurantData = async () => {
      const restaurantDocRef = doc(db, "Restaurant", restaurantId);
      const docSnap = await getDoc(restaurantDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRestaurant({
          ...data,
          users: data.users || [],
        });

        await fetchAllUsers();
      } else {
        toast({
          title: "Error",
          description: "No se encontró el restaurante.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        navigate("/");
      }
    };

    fetchRestaurantData();
  }, [restaurantId, navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRestaurant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFotosChange = (index, value) => {
    const newFotos = [...restaurant.foto];
    newFotos[index] = value;
    setRestaurant((prev) => ({ ...prev, foto: newFotos }));
  };

  const addFotoInput = () => {
    setRestaurant((prev) => ({ ...prev, foto: [...prev.foto, ""] }));
  };

  const removeFotoInput = (index) => {
    const filteredFotos = restaurant.foto.filter((_, i) => i !== index);
    setRestaurant((prev) => ({ ...prev, foto: filteredFotos }));
  };

  const handleUserChange = (index, field, value) => {
    const updatedUsers = [...restaurant.users];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    setRestaurant((prev) => ({ ...prev, users: updatedUsers }));
  };

  const addUser = () => {
    setAddingNewUser(true);
    setRestaurant((prev) => ({
      ...prev,
      users: [
        ...prev.users,
        { userId: "", responsabilitat: "", propietari: false, anydeinici: "" },
      ],
    }));
  };

  const removeUser = (index) => {
    const filteredUsers = restaurant.users.filter((_, i) => i !== index);
    setRestaurant((prev) => ({ ...prev, users: filteredUsers }));
    setAddingNewUser(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getFirestore(app);
    const restaurantDocRef = doc(db, "Restaurant", restaurantId);

    try {
      await setDoc(restaurantDocRef, restaurant, { merge: true });
      toast({
        title: "Restaurante Actualizado",
        description:
          "Los datos del restaurante se han actualizado correctamente.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/"); // O redirige a una página de éxito
    } catch (error) {
      console.error("Error actualizando el restaurante:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el restaurante.",
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
          ¡Editeu els dades dels restaurants!
        </Heading>
      </VStack>
      <VStack as="form" onSubmit={handleSubmit} spacing={5}>
        <FormControl maxW={600} isRequired>
          <FormLabel>Nom del restaurant</FormLabel>
          <Input
            name="nom"
            value={restaurant.nom}
            onChange={handleChange}
            placeholder="Nom del restaurant"
          />
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel>Telèfon</FormLabel>
          <Input
            name="tel"
            value={restaurant.tel}
            onChange={handleChange}
            placeholder="Telèfon del restaurant"
          />
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel>Lloc web</FormLabel>
          <Input
            name="web"
            value={restaurant.web}
            onChange={handleChange}
            placeholder="URL del lloc web"
          />
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel>Longitud</FormLabel>
          <Input
            name="longitud"
            value={restaurant.longitud}
            onChange={handleChange}
            placeholder="Longitud geográfica"
          />
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel>Latitud</FormLabel>
          <Input
            name="latitud"
            value={restaurant.latitud}
            onChange={handleChange}
            placeholder="Latitud geográfica"
          />
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel>Instagram</FormLabel>
          <Input
            name="instagram"
            value={restaurant.instagram}
            onChange={handleChange}
            placeholder="Instagram del restaurant"
          />
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel>Fotos</FormLabel>
          {restaurant.foto.map((url, index) => (
            <Box key={index} display="flex" alignItems="center">
              <Input
                value={url}
                onChange={(e) => handleFotosChange(index, e.target.value)}
                placeholder="URL de la foto"
              />
              <Button
                colorScheme="red"
                onClick={() => removeFotoInput(index)}
                ml={2}
              >
                <DeleteIcon />
              </Button>
            </Box>
          ))}
          <Button onClick={addFotoInput} colorScheme="blue" mt={2}>
            Afegir una altra foto
          </Button>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel>Direcció</FormLabel>
          <Input
            name="direccio"
            value={restaurant.direccio}
            onChange={handleChange}
            placeholder="Direcció del restaurant"
          />
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel>Descripció</FormLabel>
          <Input
            name="descripcio"
            value={restaurant.descripcio}
            onChange={handleChange}
            placeholder="Descripció del restaurant"
          />
        </FormControl>

        <FormControl maxW={600} mt={10}>
          <FormLabel>Treballadors</FormLabel>

          {restaurant.users.map((user, index) => (
            <Box key={index} mb={5} w="100%">
              <FormControl maxW={600} y mx="auto" isRequired>
                <FormLabel mt={5}>Usuari</FormLabel>
                {user.userId ? (
                  <Text>
                    {allUsers.find((u) => u.id === user.userId)?.nom}{" "}
                    {allUsers.find((u) => u.id === user.userId)?.cognom}
                  </Text>
                ) : (
                  <Select
                    placeholder="Seleccioneu un usuari"
                    onChange={(e) =>
                      handleUserChange(index, "userId", e.target.value)
                    }
                    value={user.userId || ""}
                  >
                    {allUsers.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.nom} {option.cognom}
                      </option>
                    ))}
                  </Select>
                )}
              </FormControl>
              <FormControl maxW={600} y mx="auto" mt={5} isRequired>
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
              <FormControl maxW={600} y mx="auto" mt={5} isRequired>
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
              <FormControl maxW={600} y mx="auto" mt={5}>
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
                <Button
                  position="absolute"
                  right={0}
                  colorScheme="red"
                  onClick={() => removeUser(index)}
                >
                  <DeleteIcon />
                </Button>
              </FormControl>
            </Box>
          ))}

          <Button onClick={addUser} colorScheme="blue" mt={5}>
            Afegir més treballadors
          </Button>
        </FormControl>

        <Button mt={5} mb={20} colorScheme="blue" type="submit">
          Guardar Canvis
        </Button>
      </VStack>
    </Box>
  );
};

export default EditRestaurantForm;
