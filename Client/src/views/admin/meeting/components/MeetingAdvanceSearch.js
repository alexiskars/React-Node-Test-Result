import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Grid,
  GridItem,
  Input,
  FormLabel,
  Text,
  Button,
} from "@chakra-ui/react";
import Spinner from "components/spinner/Spinner";
import {
  getSearchData,
  setGetTagValues,
  setSearchValue,
} from "../../../../redux/slices/advanceSearchSlice";
import { useDispatch } from "react-redux";

const MeetingAdvanceSearch = (props) => {
  const {
    allData,
    advanceSearch,
    setAdvanceSearch,
    isLoding,
    setSearchedData,
    setDisplaySearchData,
    setSearchbox,
  } = props;

  const dispatch = useDispatch();
  const initialValues = {
    agenda: "",
    createBy: "",
    startDate: "",
    endDate: "",
    timeStartDate: "",
    timeEndDate: "",
  };
  const validationSchema = yup.object({
    agenda: yup.string(),
    createBy: yup.string().email("Invalid email format"),
  });
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: (values, { resetForm }) => {
      dispatch(setSearchValue(values));
      dispatch(
        getSearchData({ values: values, allData: allData, type: "Meeting" })
      );

      const dateFrom = `${values?.startDate && `From: ${values?.startDate}`}${
        values?.endDate && ` To: ${values?.endDate}`
      }`;
      const timeDateFrom = `${
        values?.timeStartDate && `From: ${values?.timeStartDate}`
      }${values?.timeEndDate && ` To: ${values?.timeEndDate}`}`;

      const getValue = [
        {
          name: ["agenda"],
          value: values.agenda,
        },
        {
          name: ["createBy"],
          value: values.createBy,
        },
        {
          name: ["startDate", "endDate"],
          value: dateFrom,
        },
        {
          name: ["timeStartDate", "timeEndDate"],
          value: timeDateFrom,
        },
      ];
      dispatch(setGetTagValues(getValue.filter((item) => item.value)));
      setDisplaySearchData(true);
      setAdvanceSearch(false);
      resetForm();
      setSearchbox("");
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
    resetForm,
    dirty,
  } = formik;

  return (
    <>
      <Modal
        onClose={() => {
          setAdvanceSearch(false);
          resetForm();
        }}
        isOpen={advanceSearch}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Advance Search</ModalHeader>
          <ModalCloseButton
            onClick={() => {
              setAdvanceSearch(false);
              resetForm();
            }}
          />
          <ModalBody>
            <Grid templateColumns="repeat(12, 1fr)" mb={3} gap={2}>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="600"
                  color={"#000"}
                  mb="0"
                  mt={2}
                >
                  Agenda
                </FormLabel>
                <Input
                  fontSize="sm"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values?.agenda}
                  name="agenda"
                  placeholder="Enter Lead Name"
                  fontWeight="500"
                />
                <Text mb="10px" color={"red"}>
                  {" "}
                  {errors.agenda && touched.agenda && errors.agenda}
                </Text>
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="600"
                  color={"#000"}
                  mb="0"
                  mt={2}
                >
                  Create By
                </FormLabel>
                <Input
                  fontSize="sm"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values?.createBy}
                  name="createBy"
                  placeholder="Enter Lead Email"
                  fontWeight="500"
                />
                <Text mb="10px" color={"red"}>
                  {" "}
                  {errors.createBy && touched.createBy && errors.createBy}
                </Text>
              </GridItem>
              <GridItem colSpan={{ base: 12 }}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="600"
                  color={"#000"}
                  mb="0"
                  mt={2}
                >
                  Date & time
                </FormLabel>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="600"
                  color={"#000"}
                  mb="0"
                  mt={2}
                >
                  From
                </FormLabel>
                <Input
                  fontSize="sm"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.startDate}
                  type="date"
                  name="startDate"
                  fontWeight="500"
                />
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="600"
                  color={"#000"}
                  mb="0"
                  mt={2}
                >
                  To
                </FormLabel>
                <Input
                  fontSize="sm"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.endDate}
                  min={values.startDate}
                  type="date"
                  name="endDate"
                  fontWeight="500"
                />
              </GridItem>

              <GridItem colSpan={{ base: 12 }}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="600"
                  color={"#000"}
                  mb="0"
                  mt={2}
                >
                  Time Stamp
                </FormLabel>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="600"
                  color={"#000"}
                  mb="0"
                  mt={2}
                >
                  From
                </FormLabel>
                <Input
                  fontSize="sm"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.timeStartDate}
                  type="date"
                  name="timeStartDate"
                  fontWeight="500"
                />
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="600"
                  color={"#000"}
                  mb="0"
                  mt={2}
                >
                  To
                </FormLabel>
                <Input
                  fontSize="sm"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.timeEndDate}
                  min={values.timeStartDate}
                  type="date"
                  name="timeEndDate"
                  fontWeight="500"
                />
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="brand"
              mr={2}
              onClick={handleSubmit}
              disabled={isLoding || !dirty ? true : false}
            >
              {isLoding ? <Spinner /> : "Search"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={() => resetForm()}
            >
              Clear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MeetingAdvanceSearch;
