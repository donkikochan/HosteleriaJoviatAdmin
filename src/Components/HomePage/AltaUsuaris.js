"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  useToast,
  VStack,
  HStack,
  Input,
  Avatar,
  Card,
  CardBody,
  Badge,
  useDisclosure,
} from "@chakra-ui/react"
import { useLocation } from "wouter"
import { db } from "../../firebaseConfig"
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"
import { ChevronRightIcon } from "@chakra-ui/icons"
import Sidebar from "../Sidebar" // Import the Sidebar component

const AltaUsuaris = () => {
  const [, setLocation] = useLocation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: openConfirm, onClose: closeConfirm } = useDisclosure()
  const { isOpen: isRejectOpen, onOpen: openReject, onClose: closeReject } = useDisclosure()
  const [rejectReason, setRejectReason] = useState("")
  const [processingAction, setProcessingAction] = useState(false)
  const toast = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const usersCollection = collection(db, "AltaUsers")
      const usersSnapshot = await getDocs(usersCollection)

      const usersList = usersSnapshot.docs.map((doc) => {
        const userData = doc.data();
        // Procesar correctamente la fecha de revisión si existe
        if (userData.reviewLaterDate) {
          // Mantener el objeto Timestamp tal como está para que toDate() funcione correctamente
          // No es necesario convertirlo aquí, solo asegurarse de que existe
          console.log("Usuario con fecha de revisión:", userData.username);
        }
        return {
          id: doc.id,
          ...userData,
        };
      })

      console.log("Usuaris carregats:", usersList.length)
      setUsers(usersList)
    } catch (error) {
      console.error("Error al carregar els usuaris:", error)
      toast({
        title: "Error",
        description: "No s'han pogut carregar els usuaris",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const openUserDetails = (user) => {
    // Asegurarse de que la fecha se maneja correctamente antes de mostrar el usuario
    const processedUser = {
      ...user,
      // Si existe reviewLaterDate y es un objeto Timestamp, mantenerlo como está
      // Si no, asegurarse de que sea un objeto Date válido
      reviewLaterDate: user.reviewLaterDate 
        ? (user.reviewLaterDate.toDate ? user.reviewLaterDate : new Date(user.reviewLaterDate))
        : null
    }
    setSelectedUser(processedUser)
    openModal()
  }

  const handleCloseModal = () => {
    closeModal()
    setSelectedUser(null)
  }

  const showConfirmModal = () => {
    closeModal()
    openConfirm()
  }

  const showRejectModal = () => {
    closeModal()
    openReject()
  }

  const reviewLater = async () => {
    if (!selectedUser) return

    setProcessingAction(true)
    try {
      const currentDate = new Date();
      // Marcar el usuario como "para revisar más tarde"
      await updateDoc(doc(db, "AltaUsers", selectedUser.id), {
        reviewLater: true,
        reviewLaterDate: currentDate,
      })

      // Actualizar la lista local
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, reviewLater: true, reviewLaterDate: currentDate } : user,
        ),
      )

      toast({
        title: "Revisió ajornada",
        description: `L'usuari ${selectedUser.username} es revisarà més tard.`,
        status: "info",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error("Error al marcar l'usuari per revisar més tard:", error)
      toast({
        title: "Error",
        description: "No s'ha pogut ajornar la revisió. Torneu-ho a provar.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setProcessingAction(false)
      closeModal()
      setSelectedUser(null)  // Limpiar el usuario seleccionado al cerrar
    }
  }

  const acceptUser = async () => {
    if (!selectedUser) return

    setProcessingAction(true)
    try {
      await setDoc(doc(db, "users", selectedUser.userId), {
        username: selectedUser.username,
        apellidos: selectedUser.apellidos,
        email: selectedUser.email,
        imageUrl: selectedUser.imageUrl || null,
        mobilePhone: selectedUser.mobilePhone || null,
        birth: selectedUser.birth || null,
        academicStatus: selectedUser.academicStatus || "Alumne",
        instagram: selectedUser.instagram || null,
        linkedin: selectedUser.linkedin || null,
        restaurants: selectedUser.restaurants || [],
        createdAt: selectedUser.createdAt || new Date(),
        verified: true,
      })

      await deleteDoc(doc(db, "AltaUsers", selectedUser.id))
      setUsers(users.filter((user) => user.id !== selectedUser.id))

      toast({
        title: "Usuari verificat",
        description: `${selectedUser.username} ha estat verificat correctament.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error("Error al verificar l'usuari:", error)
      toast({
        title: "Error",
        description: "No s'ha pogut verificar l'usuari. Torneu-ho a provar.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setProcessingAction(false)
      closeConfirm()
    }
  }

  const rejectUser = async () => {
    if (!selectedUser || !rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Cal proporcionar un motiu pel rebuig.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setProcessingAction(true)
    try {
      const rejectionData = {
        userId: selectedUser.userId,
        username: selectedUser.username,
        apellidos: selectedUser.apellidos,
        email: selectedUser.email,
        rejectionReason: rejectReason,
        rejectionDate: new Date(),
        imageUrl: selectedUser.imageUrl || null,
        mobilePhone: selectedUser.mobilePhone || null,
        birth: selectedUser.birth || null,
        instagram: selectedUser.instagram || null,
        linkedin: selectedUser.linkedin || null,
      }

      await setDoc(doc(db, "RechazarUser", selectedUser.id), rejectionData)
      await deleteDoc(doc(db, "AltaUsers", selectedUser.id))

      toast({
        title: "Usuari rebutjat",
        description: `S'ha rebutjat l'usuari ${selectedUser.username}.`,
        status: "info",
        duration: 5000,
        isClosable: true,
      })

      setUsers(users.filter((user) => user.id !== selectedUser.id))
      closeReject()
      setRejectReason("")
    } catch (error) {
      console.error("Error al rebutjar l'usuari:", error)
      toast({
        title: "Error",
        description: "No s'ha pogut rebutjar l'usuari. Torneu-ho a provar.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setProcessingAction(false)
    }
  }

  // The content that will be wrapped by the Sidebar
  const content = (
    <Box p={5} mt={20}>
      {/* Remove the "Back to home" button since the sidebar already has navigation */}
      <VStack spacing={4} align="stretch">
        {users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id} onClick={() => openUserDetails(user)} cursor="pointer" _hover={{ shadow: "md" }}>
              <CardBody>
                <HStack spacing={4}>
                  <Avatar size="md" src={user.imageUrl} name={user.username} />
                  <Box flex={1}>
                    <Text fontWeight="bold">{user.username || "Sense nom"}</Text>
                    <Text color="gray.600">{user.email || "Sense email"}</Text>
                    {user.rejected && <Badge colorScheme="red">Rebutjat</Badge>}
                    {user.reviewLater && <Badge colorScheme="purple">Revisar més tard</Badge>}
                  </Box>
                  <ChevronRightIcon />
                </HStack>
              </CardBody>
            </Card>
          ))
        ) : (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg">No hi ha usuaris pendents d'aprovació</Text>
          </Box>
        )}
      </VStack>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalls de l'Usuari</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                <Avatar size="2xl" src={selectedUser.imageUrl} name={selectedUser.username} alignSelf="center" />
                <Text>
                  <strong>Nom:</strong> {selectedUser.username}
                </Text>
                <Text>
                  <strong>Cognoms:</strong> {selectedUser.apellidos}
                </Text>
                <Text>
                  <strong>Email:</strong> {selectedUser.email}
                </Text>
                <Text>
                  <strong>Telèfon:</strong> {selectedUser.mobilePhone || "No especificat"}
                </Text>
                <Text>
                  <strong>Instagram:</strong> {selectedUser.instagram || "No especificat"}
                </Text>
                <Text>
                  <strong>LinkedIn:</strong> {selectedUser.linkedin || "No especificat"}
                </Text>
                {selectedUser.reviewLater && (
                  <Text>
                    <strong>Marcat per revisar més tard:</strong>{" "}
                    {selectedUser.reviewLaterDate
                      ? (selectedUser.reviewLaterDate.toDate 
                          ? new Date(selectedUser.reviewLaterDate.toDate()).toLocaleDateString()
                          : new Date(selectedUser.reviewLaterDate).toLocaleDateString())
                      : "Sí"}
                  </Text>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={reviewLater}>
              Revisar més tard
            </Button>
            <Button colorScheme="red" mr={3} onClick={showRejectModal}>
              Rebutjar
            </Button>
            <Button colorScheme="green" onClick={showConfirmModal}>
              Acceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={closeConfirm}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Acceptació</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Esteu segur que voleu acceptar aquest usuari?</ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={closeConfirm}>
              Cancel·lar
            </Button>
            <Button colorScheme="green" onClick={acceptUser} isLoading={processingAction}>
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isRejectOpen} onClose={closeReject}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Motiu del Rebuig</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Introduïu el motiu del rebuig"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={closeReject}>
              Cancel·lar
            </Button>
            <Button colorScheme="red" onClick={rejectUser} isLoading={processingAction}>
              Rebutjar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )

  if (loading) {
    return (
      <Sidebar>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
        </Box>
      </Sidebar>
    )
  }

  // Wrap the content with the Sidebar component
  return <Sidebar>{content}</Sidebar>
}

export default AltaUsuaris
