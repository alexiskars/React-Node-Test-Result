import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import ContactModel from "components/commonTableModel/ContactModel";
import LeadModel from "components/commonTableModel/LeadModel";
import MultiContactModel from "components/commonTableModel/MultiContactModel";
import MultiLeadModel from "components/commonTableModel/MultiLeadModel";
import Spinner from "components/spinner/Spinner";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { LiaMousePointerSolid } from "react-icons/lia";
import { BsCalendar3 } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { MeetingSchema } from "schema";
import { getApi, postApi } from "services/api";

const AddMeeting = (props) => {
  const {
    onClose,
    isOpen,
    setAction,
    fetchData,
    id,
    lead,
    contactEmail,
    leadEmail,
  } = props;
  const [assignToLeadData, setAssignToLeadData] = useState([]);
  const [assignToContactData, setAssignToContactData] = useState([]);
  const [contactModelOpen, setContactModel] = useState(false);
  const [leadModelOpen, setLeadModel] = useState(false);
  const [isLoding, setIsLoding] = useState(false);
  const dispatch = useDispatch();
  const todayTime = new Date().toISOString().split(".")[0];
  const user = JSON.parse(localStorage.getItem("user"));

  const initialValues = {
    agenda: "",
    attendes: props.id && props.lead !== true ? [props.id] : [],
    attendesLead: props.id && props.lead === true ? [props.id] : [],
    location: "",
    related: props.lead !== true ? "Contact" : "Lead",
    dateTime: "",
    notes: "",
    createByContact: props.id && props.lead !== true ? props.id : "",
    createByLead: props.id && props.lead === true ? props.id : "",
    category: props.lead !== true ? "Contact" : "Lead",
    createBy: user?._id,
    duration: 60,
    backgroundColor: "#e53e3e",
    textColor: "#ffffff",
    allDay: false,
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: MeetingSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      AddData();
      resetForm();
    },
  });

  const {
    errors,
    touched,
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = formik;

  const AddData = async () => {
    try {
      setIsLoding(true);
      let response = await postApi("api/meeting/add", values);
      if (response.status === 200) {
        props.onClose();
        if (fetchData) {
          fetchData(1);
        }
        setAction((pre) => !pre);

        toast.success("Meeting scheduled successfully");
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to schedule meeting");
    } finally {
      setIsLoding(false);
    }
  };

  useEffect(() => {
    try {
      if (values.category === "Contact" && assignToContactData.length <= 0) {
        const fetchContacts = async () => {
          const result = await getApi(
            user.role === "superAdmin"
              ? "api/contact/"
              : `api/contact/?createBy=${user._id}`
          );
          console.log("Raw contact data from API:", result?.data);
          setAssignToContactData(result?.data || []);
        };
        fetchContacts();
      } else if (values.category === "Lead" && assignToLeadData.length <= 0) {
        const fetchLeads = async () => {
          const result = await getApi(
            user.role === "superAdmin"
              ? "api/lead/"
              : `api/lead/?createBy=${user._id}`
          );
          console.log("Raw lead data from API:", result?.data);
          setAssignToLeadData(result?.data || []);
        };
        fetchLeads();
      }
    } catch (e) {
      console.log(e);
    }
  }, [values.category]);

  const extractLabels = (selectedItems) => {
    return selectedItems.map((item) => item._id);
  };

  const attendeesWithLabel = (
    values.category === "Contact" ? assignToContactData : assignToLeadData
  )?.map((item) => ({
    ...item,
    value: item._id,
    label:
      values.category === "Contact"
        ? item.fullName || "Unnamed Contact"
        : item.leadName || "Unnamed Lead",
  }));

  console.log("Contact data for dropdown:", assignToContactData);
  console.log("Formatted attendees with labels:", attendeesWithLabel);

  const durationOptions = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
    { value: 180, label: "3 hours" },
    { value: 240, label: "4 hours" },
  ];

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent height={"580px"}>
        <ModalHeader>Add Meeting </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY={"auto"} height={"400px"}>
          {/* Contact Model  */}
          <ContactModel
            isOpen={contactModelOpen}
            data={assignToContactData}
            onClose={setContactModel}
            fieldName="createByContact"
            setFieldValue={setFieldValue}
          />
          {/* Lead Model  */}
          <LeadModel
            isOpen={leadModelOpen}
            data={assignToLeadData}
            onClose={setLeadModel}
            fieldName="createByLead"
            setFieldValue={setFieldValue}
          />

          <Grid templateColumns="repeat(12, 1fr)" gap={3}>
            <GridItem colSpan={{ base: 12 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Agenda<Text color={"red"}>*</Text>
              </FormLabel>
              <Input
                fontSize="sm"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.agenda}
                name="agenda"
                placeholder="Agenda"
                fontWeight="500"
                borderColor={errors.agenda && touched.agenda ? "red.300" : null}
              />
              <Text fontSize="sm" mb="10px" color={"red"}>
                {" "}
                {errors.agenda && touched.agenda && errors.agenda}
              </Text>
            </GridItem>

            <GridItem colSpan={{ base: 12, md: 6 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Related
              </FormLabel>
              <RadioGroup
                onChange={(e) => {
                  setFieldValue("category", e);
                  setFieldValue("createByContact", "");
                  setFieldValue("createByLead", "");
                  setFieldValue("related", e);
                  setFieldValue("attendes", []);
                  setFieldValue("attendesLead", []);
                }}
                value={values.category}
              >
                <Stack direction="row">
                  <Radio value="Contact">Contact</Radio>
                  <Radio value="Lead">Lead</Radio>
                </Stack>
              </RadioGroup>
              <Text mb="10px" fontSize="sm" color={"red"}>
                {" "}
                {errors.category && touched.category && errors.category}
              </Text>
            </GridItem>

            <GridItem colSpan={{ base: 12 }}>
              {values.category === "Contact" ? (
                <>
                  <GridItem colSpan={{ base: 12, md: 6 }}>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      mb="8px"
                    >
                      Primary Contact
                    </FormLabel>
                    <Flex justifyContent={"space-between"}>
                      <Select
                        value={values.createByContact}
                        name="createByContact"
                        onChange={handleChange}
                        mb={
                          errors.createByContact && touched.createByContact
                            ? undefined
                            : "10px"
                        }
                        fontWeight="500"
                        placeholder={"Select Contact"}
                        borderColor={
                          errors.createByContact && touched.createByContact
                            ? "red.300"
                            : null
                        }
                      >
                        {assignToContactData?.map((item) => (
                          <option value={item._id} key={item._id}>
                            {item.fullName || "Unnamed Contact"}
                          </option>
                        ))}
                      </Select>
                      <IconButton
                        onClick={() => setContactModel(true)}
                        ml={2}
                        fontSize="25px"
                        icon={<LiaMousePointerSolid />}
                      />
                    </Flex>
                    <Text mb="10px" fontSize="sm" color={"red"}>
                      {" "}
                      {errors.createByContact &&
                        touched.createByContact &&
                        errors.createByContact}
                    </Text>
                  </GridItem>
                </>
              ) : values.category === "Lead" ? (
                <>
                  <GridItem colSpan={{ base: 12, md: 6 }}>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      mb="8px"
                    >
                      Primary Lead
                    </FormLabel>
                    <Flex justifyContent={"space-between"}>
                      <Select
                        value={values.createByLead}
                        name="createByLead"
                        onChange={handleChange}
                        mb={
                          errors.createByLead && touched.createByLead
                            ? undefined
                            : "10px"
                        }
                        fontWeight="500"
                        placeholder={"Select Lead"}
                        borderColor={
                          errors.createByLead && touched.createByLead
                            ? "red.300"
                            : null
                        }
                      >
                        {assignToLeadData?.map((item) => {
                          return (
                            <option value={item._id} key={item._id}>
                              {item.leadName}
                            </option>
                          );
                        })}
                      </Select>
                      <IconButton
                        onClick={() => setLeadModel(true)}
                        ml={2}
                        fontSize="25px"
                        icon={<LiaMousePointerSolid />}
                      />
                    </Flex>
                    <Text mb="10px" fontSize="sm" color={"red"}>
                      {" "}
                      {errors.createByLead &&
                        touched.createByLead &&
                        errors.createByLead}
                    </Text>
                  </GridItem>
                </>
              ) : (
                ""
              )}
            </GridItem>

            <GridItem colSpan={{ base: 12 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Additional Attendees
              </FormLabel>
              {values.category === "Contact" ? (
                <MultiContactModel
                  data={assignToContactData}
                  isOpen={contactModelOpen}
                  onClose={setContactModel}
                  fieldName="attendes"
                  setFieldValue={setFieldValue}
                  initialSelected={
                    values.createByContact ? [values.createByContact] : []
                  }
                />
              ) : (
                <MultiLeadModel
                  data={assignToLeadData}
                  isOpen={leadModelOpen}
                  onClose={setLeadModel}
                  fieldName="attendesLead"
                  setFieldValue={setFieldValue}
                  initialSelected={
                    values.createByLead ? [values.createByLead] : []
                  }
                />
              )}

              <Select
                isMulti
                name={
                  values.category === "Contact" ? "attendes" : "attendesLead"
                }
                placeholder="Select additional attendees"
                closeMenuOnSelect={false}
                value={
                  values.category === "Contact"
                    ? values.attendes
                    : values.attendesLead
                }
                onChange={(selectedOptions) => {
                  console.log("Selected options:", selectedOptions);
                  const selectedIds = selectedOptions
                    ? selectedOptions.map((opt) => opt.value)
                    : [];
                  setFieldValue(
                    values.category === "Contact" ? "attendes" : "attendesLead",
                    selectedIds
                  );
                }}
              >
                {attendeesWithLabel.map((item) => {
                  console.log("Rendering dropdown item:", item);
                  return (
                    <option key={item._id} value={item._id}>
                      {item.label}
                    </option>
                  );
                })}
              </Select>
            </GridItem>

            <GridItem colSpan={{ base: 12, md: 6 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Date Time<Text color={"red"}>*</Text>
              </FormLabel>
              <Input
                fontSize="sm"
                type="datetime-local"
                onChange={handleChange}
                onBlur={handleBlur}
                min={dayjs(todayTime).format("YYYY-MM-DD HH:mm")}
                value={values.dateTime}
                name="dateTime"
                placeholder="Date Time"
                fontWeight="500"
                borderColor={
                  errors.dateTime && touched.dateTime ? "red.300" : null
                }
              />
              <Text fontSize="sm" mb="10px" color={"red"}>
                {" "}
                {errors.dateTime && touched.dateTime && errors.dateTime}
              </Text>
            </GridItem>

            <GridItem colSpan={{ base: 12, md: 6 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Duration
              </FormLabel>
              <Select
                fontSize="sm"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.duration}
                name="duration"
                fontWeight="500"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </GridItem>

            <GridItem colSpan={{ base: 12 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Location
              </FormLabel>
              <Input
                fontSize="sm"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.location}
                name="location"
                placeholder="Location"
                fontWeight="500"
                borderColor={
                  errors.location && touched.location ? "red.300" : null
                }
              />
              <Text mb="10px" color={"red"} fontSize="sm">
                {" "}
                {errors.location && touched.location && errors.location}
              </Text>
            </GridItem>

            <GridItem colSpan={{ base: 12 }}>
              <Checkbox
                isChecked={values.allDay}
                onChange={(e) => setFieldValue("allDay", e.target.checked)}
                colorScheme="brand"
                mb={2}
              >
                All Day Event
              </Checkbox>
            </GridItem>

            <GridItem colSpan={{ base: 12 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Notes
              </FormLabel>
              <Textarea
                resize={"none"}
                fontSize="sm"
                placeholder="Notes"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.notes}
                name="notes"
                fontWeight="500"
                borderColor={errors.notes && touched.notes ? "red.300" : null}
              />
              <Text mb="10px" color={"red"}>
                {" "}
                {errors.notes && touched.notes && errors.notes}
              </Text>
            </GridItem>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Flex w="100%" justifyContent="space-between" alignItems="center">
            <Flex alignItems="center">
              <Box display="flex" alignItems="center" mr={4}>
                <BsCalendar3
                  size={16}
                  color="#4299E1"
                  style={{ marginRight: "6px" }}
                />
                <Text fontSize="sm" fontWeight="500">
                  Will be added to calendar
                </Text>
              </Box>
            </Flex>

            <Flex>
              <Button
                size="sm"
                variant="brand"
                me={2}
                disabled={isLoding}
                onClick={handleSubmit}
              >
                {isLoding ? <Spinner /> : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorScheme="red"
                onClick={() => {
                  formik.resetForm();
                  onClose();
                }}
              >
                Close
              </Button>
            </Flex>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddMeeting;
