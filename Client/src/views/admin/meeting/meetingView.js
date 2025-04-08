import { CloseIcon, DeleteIcon, EditIcon, ViewIcon } from "@chakra-ui/icons";
import {
  DrawerFooter,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import Spinner from "components/spinner/Spinner";
import moment from "moment";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApi } from "services/api";
import { useNavigate } from "react-router-dom";
import { HasAccess } from "../../../redux/accessUtils";
import { MdLeaderboard } from "react-icons/md";
import { IoIosContact } from "react-icons/io";

const MeetingView = (props) => {
  const { onClose, isOpen, info, fetchData, setAction, action, access } = props;
  const [data, setData] = useState();
  const [edit, setEdit] = useState(false);
  const [deleteModel, setDelete] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [isLoding, setIsLoding] = useState(false);
  const navigate = useNavigate();

  const fetchViewData = async () => {
    if (info) {
      setIsLoding(true);
      let result = await getApi(
        "api/meeting/view/",
        info?.event ? info?.event?.id : info
      );
      setData(result?.data);
      setIsLoding(false);
    }
  };

  useEffect(() => {
    fetchViewData();
  }, [action, info]);

  const [contactAccess, leadAccess] = HasAccess(["Contacts", "Leads"]);

  const handleViewOpen = () => {
    if (info?.event) {
      navigate(`/metting/${info?.event?.id}`);
    } else {
      navigate(`/metting/${info}`);
    }
  };

  const goToContactDetail = (id) => {
    if (contactAccess?.view) {
      navigate(`/contactView/${id}`);
    }
  };

  const goToLeadDetail = (id) => {
    if (leadAccess?.view) {
      navigate(`/leadView/${id}`);
    }
  };

  const getPrimaryContactName = () => {
    if (data?.createByContact) {
      if (
        typeof data.createByContact === "object" &&
        data.createByContact?.firstName
      ) {
        return `${data.createByContact.firstName} ${
          data.createByContact.lastName || ""
        }`;
      } else {
        return data?.createByName || "-";
      }
    } else if (data?.createByLead) {
      if (
        typeof data.createByLead === "object" &&
        data.createByLead?.leadName
      ) {
        return data.createByLead.leadName;
      } else {
        return data?.createByName || "-";
      }
    }

    return data?.createByName || "-";
  };

  return (
    <Modal isOpen={isOpen} size={"md"} isCentered>
      <ModalOverlay />
      <ModalContent height={"70%"}>
        <ModalHeader justifyContent="space-between" display="flex">
          Meeting
          <IconButton onClick={() => onClose(false)} icon={<CloseIcon />} />
        </ModalHeader>
        {isLoding ? (
          <Flex
            justifyContent={"center"}
            alignItems={"center"}
            mb={30}
            width="100%"
          >
            <Spinner />
          </Flex>
        ) : (
          <>
            <ModalBody overflowY={"auto"}>
              <Grid templateColumns="repeat(12, 1fr)" gap={3}>
                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={"blackAlpha.900"}
                  >
                    {" "}
                    Agenda{" "}
                  </Text>
                  <Text>{data?.agenda ? data?.agenda : " - "}</Text>
                </GridItem>
                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={"blackAlpha.900"}
                  >
                    {" "}
                    Date&Time{" "}
                  </Text>
                  <Text>
                    {data?.dateTime
                      ? moment(data?.dateTime).format("lll ")
                      : " - "}
                  </Text>
                </GridItem>
                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={"blackAlpha.900"}
                  >
                    {" "}
                    Created By{" "}
                  </Text>
                  <Text>{data?.createdByName || data?.senderName || "-"}</Text>
                </GridItem>
                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={"blackAlpha.900"}
                  >
                    {" "}
                    Primary Contact/Lead{" "}
                  </Text>
                  {data?.createByContact && contactAccess?.view ? (
                    <Text
                      color="brand.600"
                      sx={{
                        "&:hover": {
                          color: "blue.500",
                          textDecoration: "underline",
                          cursor: "pointer",
                        },
                      }}
                      onClick={() => goToContactDetail(data.createByContact)}
                    >
                      {getPrimaryContactName()}{" "}
                      <IoIosContact
                        style={{ display: "inline", marginBottom: "2px" }}
                      />
                    </Text>
                  ) : data?.createByLead && leadAccess?.view ? (
                    <Text
                      color="brand.600"
                      sx={{
                        "&:hover": {
                          color: "blue.500",
                          textDecoration: "underline",
                          cursor: "pointer",
                        },
                      }}
                      onClick={() => goToLeadDetail(data.createByLead)}
                    >
                      {getPrimaryContactName()}{" "}
                      <MdLeaderboard
                        style={{ display: "inline", marginBottom: "2px" }}
                      />
                    </Text>
                  ) : (
                    <Text>
                      {getPrimaryContactName()}{" "}
                      {data?.createByContact
                        ? "(Contact)"
                        : data?.createByLead
                        ? "(Lead)"
                        : ""}
                    </Text>
                  )}
                </GridItem>
                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={"blackAlpha.900"}
                  >
                    {" "}
                    Related{" "}
                  </Text>
                  <Text>
                    {data?.related
                      ? data?.related
                      : data?.createByContact
                      ? "Contact"
                      : data?.createByLead
                      ? "Lead"
                      : "-"}
                  </Text>
                </GridItem>
                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={"blackAlpha.900"}
                  >
                    {" "}
                    Location{" "}
                  </Text>
                  <Text>{data?.location ? data?.location : "-"}</Text>
                </GridItem>
                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={"blackAlpha.900"}
                  >
                    {" "}
                    Notes{" "}
                  </Text>
                  <Text>{data?.notes ? data?.notes : "-"}</Text>
                </GridItem>
                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={"blackAlpha.900"}
                  >
                    {" "}
                    Attendees{" "}
                  </Text>
                  {data?.attendes &&
                  data?.attendes.length > 0 &&
                  contactAccess?.view
                    ? data.attendes.map((item) => (
                        <Link to={`/contactView/${item._id}`} key={item._id}>
                          <Text
                            color="brand.600"
                            sx={{
                              "&:hover": {
                                color: "blue.500",
                                textDecoration: "underline",
                              },
                            }}
                          >
                            {item.firstName} {item.lastName}
                          </Text>
                        </Link>
                      ))
                    : data?.attendes && data?.attendes.length > 0
                    ? data.attendes.map((item) => (
                        <Text color="blackAlpha.900" key={item._id}>
                          {item.firstName} {item.lastName}
                        </Text>
                      ))
                    : null}

                  {data?.attendesLead &&
                  data?.attendesLead.length > 0 &&
                  leadAccess?.view
                    ? data.attendesLead.map((item) => (
                        <Link to={`/leadView/${item._id}`} key={item._id}>
                          <Text
                            color="brand.600"
                            sx={{
                              "&:hover": {
                                color: "blue.500",
                                textDecoration: "underline",
                              },
                            }}
                          >
                            {item.leadName}
                          </Text>
                        </Link>
                      ))
                    : data?.attendesLead && data?.attendesLead.length > 0
                    ? data.attendesLead.map((item) => (
                        <Text color="blackAlpha.900" key={item._id}>
                          {item.leadName}
                        </Text>
                      ))
                    : null}

                  {(!data?.attendes || data.attendes.length === 0) &&
                    (!data?.attendesLead || data.attendesLead.length === 0) && (
                      <Text>-</Text>
                    )}
                </GridItem>
              </Grid>
            </ModalBody>
            <DrawerFooter>
              {access?.view && (
                <IconButton
                  variant="outline"
                  colorScheme={"green"}
                  onClick={() => handleViewOpen()}
                  borderRadius="10px"
                  size="md"
                  icon={<ViewIcon />}
                />
              )}
              {access?.update && (
                <IconButton
                  variant="outline"
                  onClick={() => setEdit(true)}
                  ml={3}
                  borderRadius="10px"
                  size="md"
                  icon={<EditIcon />}
                />
              )}
              {access?.delete && (
                <IconButton
                  colorScheme="red"
                  onClick={() => setDelete(true)}
                  ml={3}
                  borderRadius="10px"
                  size="md"
                  icon={<DeleteIcon />}
                />
              )}
            </DrawerFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MeetingView;
