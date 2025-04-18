"use client"

import { useState, useEffect } from "react"
import { Box, VStack, Text, List, ListItem, Button, HStack, Image, Heading } from "@chakra-ui/react"
import { EditIcon } from "@chakra-ui/icons"
import { getFirestore, collection, getDocs } from "firebase/firestore"
import { app } from "../../firebaseConfig"
import { useLocation } from "wouter"
import Sidebar from "../Sidebar" // Import the Sidebar component

const ShowAllRestaurants = () => {
  const [restaurants, setRestaurants] = useState([])
  const [location, navigate] = useLocation()

  const handleEditClick = (restaurantId) => {
    navigate(`/edit-restaurant/${restaurantId}`)
  }

  useEffect(() => {
    const fetchRestaurants = async () => {
      const db = getFirestore(app)
      const querySnapshot = await getDocs(collection(db, "Restaurant"))
      const restaurantsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setRestaurants(restaurantsList)
    }

    fetchRestaurants()
  }, [])

  // The content that will be wrapped by the Sidebar
  const content = (
    <Box>
      {/* Remove the "Back to home" button since the sidebar already has navigation */}
      <Box mt={"10rem"} padding={4} bg="gray.50" maxW="3xl" marginX="auto" borderRadius="lg" shadow="md">
        <VStack spacing={4}>
          <Heading
            as="h1"
            fontFamily="'Hanken Grotesk', Arial, sans-serif"
            size="xl"
            w={{ base: "200", md: "600" }}
            maxW={600}
            mb={5}
            textAlign={"center"}
          >
            Lista de Restaurants
          </Heading>
          <List spacing={3} width="full">
            {restaurants.map((restaurant) => (
              <ListItem
                key={restaurant.id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                padding={2}
                bg="white"
                borderRadius="md"
                shadow="base"
              >
                <HStack>
                  <Image width={"150px"} src={restaurant.foto[0] || "/placeholder.svg"} mr={4} borderRadius={10} />
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">
                      {restaurant.nom}{" "}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {restaurant.direccio}
                    </Text>
                  </Box>
                </HStack>
                <HStack>
                  <Button colorScheme="blue" size="sm" ml={2} onClick={() => handleEditClick(restaurant.id)}>
                    <EditIcon />
                  </Button>
                </HStack>
              </ListItem>
            ))}
          </List>
        </VStack>
      </Box>
    </Box>
  )

  // Wrap the content with the Sidebar component
  return <Sidebar>{content}</Sidebar>
}

export default ShowAllRestaurants

