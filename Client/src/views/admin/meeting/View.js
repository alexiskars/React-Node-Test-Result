import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import Card from "components/card/Card";
import { HSeparator } from "components/separator/Separator";
import Spinner from "components/spinner/Spinner";
import moment from "moment";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosContact } from "react-icons/io";
import { MdLeaderboard } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HasAccess } from "../../../redux/accessUtils";
import { getApi, deleteApi } from "services/api";
import { DeleteIcon } from "@chakra-ui/icons";
import CommonDeleteModel from "components/commonDeleteModel";
import { FaFilePdf } from "react-icons/fa";
import html2pdf from "html2pdf.js";

const View = () => {
  const param = useParams();
  const [data, setData] = useState();
  const [deleteMany, setDeleteMany] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [isLoding, setIsLoding] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const fetchData = async () => {
    setIsLoding(true);
    let response = await getApi("api/meeting/view/", param.id);
    setData(response?.data);
    setIsLoding(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generatePDF = () => {
    setLoading(true);
    const element = document.getElementById("reports");
    const hideBtn = document.getElementById("hide-btn");
    if (element) {
      hideBtn.style.display = "none";
      html2pdf()
        .from(element)
        .set({
          margin: [0, 0, 0, 0],
          filename: `Meeting_Details_${moment().format("DD-MM-YYYY")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .save()
        .then(() => {
          setLoading(false);
          hideBtn.style.display = "";
        });
    } else {
      console.error("Element with ID 'reports' not found.");
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (ids) => {
    try {
      setIsLoding(true);
      let response = await deleteApi("api/meeting/delete/", params.id);
      if (response.status === 200) {
        setDeleteMany(false);
        navigate(-1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoding(false);
    }
  };

  const [permission, contactAccess, leadAccess] = HasAccess([
    "Meetings",
    "Contacts",
    "Leads",
  ]);

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
    <>
      {isLoding ? (
        <Flex justifyContent={"center"} alignItems={"center"} width="100%">
          <Spinner />
        </Flex>
      ) : (
        <>
          <Grid templateColumns="repeat(4, 1fr)" gap={3} id="reports">
            <GridItem colSpan={{ base: 4 }}>
              <Heading size="lg" m={3}>
                {data?.agenda || ""}
              </Heading>
            </GridItem>
            <GridItem colSpan={{ base: 4 }}>
              <Card>
                <Grid gap={4}>
                  <GridItem colSpan={2}>
                    <Box>
                      <Flex justifyContent={"space-between"}>
                        <Heading size="md" mb={3}>
                          Meeting Details
                        </Heading>
                        <Box id="hide-btn">
                          <Button
                            leftIcon={<FaFilePdf />}
                            size="sm"
                            variant="brand"
                            onClick={generatePDF}
                            disabled={loading}
                          >
                            {loading ? "Please Wait..." : "Print as PDF"}
                          </Button>
                          <Button
                            leftIcon={<IoIosArrowBack />}
                            size="sm"
                            variant="brand"
                            onClick={() => navigate(-1)}
                            style={{ marginLeft: 10 }}
                          >
                            Back
                          </Button>
                        </Box>
                      </Flex>
                      <HSeparator />
                    </Box>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
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
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Created By{" "}
                    </Text>
                    <Text>
                      {data?.createdByName || data?.senderName || "-"}
                    </Text>
                  </GridItem>

                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Primary Contact/Lead{" "}
                    </Text>
                    {data?.createByContact && contactAccess?.view ? (
                      <Link to={`/contactView/${data?.createByContact}`}>
                        <Text
                          color="brand.600"
                          sx={{
                            "&:hover": {
                              color: "blue.500",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {getPrimaryContactName()}{" "}
                          <IoIosContact
                            style={{ display: "inline", marginBottom: "2px" }}
                          />
                        </Text>
                      </Link>
                    ) : data?.createByLead && leadAccess?.view ? (
                      <Link to={`/leadView/${data?.createByLead}`}>
                        <Text
                          color="brand.600"
                          sx={{
                            "&:hover": {
                              color: "blue.500",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {getPrimaryContactName()}{" "}
                          <MdLeaderboard
                            style={{ display: "inline", marginBottom: "2px" }}
                          />
                        </Text>
                      </Link>
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

                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      DateTime{" "}
                    </Text>
                    <Text>
                      {" "}
                      {data?.dateTime
                        ? moment(data?.dateTime).format("DD-MM-YYYY  h:mma ")
                        : " - "}{" "}
                      [{data?.dateTime ? moment(data?.dateTime).toNow() : " - "}
                      ]
                    </Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Timestamp{" "}
                    </Text>
                    <Text>
                      {" "}
                      {data?.timestamp
                        ? moment(data?.timestamp).format("DD-MM-YYYY  h:mma ")
                        : " - "}{" "}
                      [
                      {data?.timestamp
                        ? moment(data?.timestamp).toNow()
                        : " - "}
                      ]
                    </Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Location{" "}
                    </Text>
                    <Text>{data?.location ? data?.location : " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
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
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Notes{" "}
                    </Text>
                    <Text>{data?.notes ? data?.notes : " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
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
                      (!data?.attendesLead ||
                        data.attendesLead.length === 0) && <Text>-</Text>}
                  </GridItem>
                </Grid>
              </Card>
            </GridItem>
          </Grid>

          {(user.role === "superAdmin" ||
            permission?.update ||
            permission?.delete) && (
            <Card mt={3}>
              <Grid templateColumns="repeat(6, 1fr)" gap={1}>
                <GridItem colStart={6}>
                  <Flex justifyContent={"right"}>
                    {user.role === "superAdmin" || permission?.delete ? (
                      <Button
                        size="sm"
                        style={{ background: "red.800" }}
                        onClick={() => setDeleteMany(true)}
                        leftIcon={<DeleteIcon />}
                        colorScheme="red"
                      >
                        Delete
                      </Button>
                    ) : (
                      ""
                    )}
                  </Flex>
                </GridItem>
              </Grid>
            </Card>
          )}
        </>
      )}

      {/* Delete model */}
      <CommonDeleteModel
        isOpen={deleteMany}
        onClose={() => setDeleteMany(false)}
        type="Meetings"
        handleDeleteData={handleDeleteMeeting}
        ids={params.id}
      />
    </>
  );
};

export default View;
