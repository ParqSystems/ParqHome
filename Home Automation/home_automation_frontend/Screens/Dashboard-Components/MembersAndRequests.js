import { useState, useEffect, useRef } from "react";
import {
    Text,
    Image,
    Pressable,
    View,
    StyleSheet,
    Animated,
    FlatList
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import LottieView from "lottie-react-native";


export default function MembersAndRequests(props) {


    const [errorOccured, setErrorOccured] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    const familyIndicatorX = useRef(new Animated.Value(0)).current;
    const pendingIndicatorX = useRef(new Animated.Value(0)).current;

    const [familyCode, setFamilyCode] = useState("");


    const [showMembers, setShowMembers] = useState(true);
    const [showFamily, setShowFamily] = useState(true);
    const [showPending, setShowPending] = useState(true);
    const [showCurrentGuests, setShowCurrentGuests] = useState(true);

    const [toggleWidth, setToggleWidth] = useState(0);

    const [members, setMembers] = useState([]);

    const [currentGuests, setCurrentGuests] = useState([]);
    const [pastGuests, setPastGuests] = useState([]);

    const [pendingRequests, setPendingRequests] = useState([]);
    // const [showGuestExpirySetter, setShowGuestExpirySetter] = useState([]);
    // const [expiryDate, setExpiryDate] = useState(new Date());

    const [rejectedRequests, setRejectedRequests] = useState([]);
    // const [showGuestExpiryEditor, setShowGuestExpiryEditor] = useState([]);


    const getFamilyCode = async () => {
        const familyCode = await AsyncStorage.getItem("familyId");
        setFamilyCode(familyCode);
    }


    const getMembersAndRequests = async () => {
        try {

            const familyId = await AsyncStorage.getItem("familyId");
            const response = await fetch(`http://localhost:5000/api/dashboard/getMembersAndRequests/${familyId}`);
            if (!response.ok) {
                //display error modal
                setErrorOccured(true);
                setIsLoading(false);
                return;
            }
            const data = await response.json();


            setIsLoading(false);


            // console.log(data);

            // console.log(data.familyMembers);
            // console.log(data.guests);

            // console.log(data.pastGuests);

            setMembers(data.familyMembers.map((fm) => (
                {
                    ...fm,
                    showDetails:false
                }
            )));
            
            
            setCurrentGuests(data.currentGuests.map((cg) => (
                {
                    ...cg,
                    showExpiryEditor:false
                }
            )));


            setPastGuests(data.pastGuests.map((pg) => (
                {
                    ...pg,
                    showExpirySetter: false,
                    showExpiryEditor:false
                }
            )));



            setPendingRequests(data.pendingRequests.map((pr) => (
                {
                    _id: pr._id,
                    memberEmail: pr.memberEmail,
                    memberName: pr.memberName,
                    memberPhone: pr.memberPhone,
                    status: pr.status,
                    showExpirySetter: false,
                    showExpiryEditor: false,
                    showDetails:false,
                    guestExpiry:""
                })));

            
            setRejectedRequests(data.rejectedRequests);

        }
        catch (error) {
            //display error modal
        }
    }


    const memberPendingRequest = async (item) => {
        try {
            const familyId = await AsyncStorage.getItem("familyId");
            const response = await fetch("http://localhost:5000/api/dashboard/memberPendingRequest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ familyId, userId: item._id, memberEmail: item.memberEmail })
            });
            if (!response.ok) {
                //display error modal
                props.displayModal({
                    text: `An error occured while approving ${item.memberName} as a family member`,
                    backgroundColor: "red",
                    textColor: "white",
                    displayDuration:2
                });
                return;
            }

            //display success modal
            props.displayModal({
                text: `${item.memberName} has been successfully added as a family member`,
                backgroundColor: "green",
                textColor: "white",
                displayDuration:2
            });


            // const tempMembers = [...members];
            // tempMembers.push(item);
            // setMembers(tempMembers);
            // const tempPendingRequests = pendingRequests.filter((r) => r._id !== item._id);
            // setPendingRequests(tempPendingRequests);

            getMembersAndRequests();

        }
        catch (error) {
            console.log(error);
            //display error modal
            props.displayModal({
                    text: `An internal server error occured while approving ${item.memberName} as a family member`,
                    backgroundColor: "red",
                    textColor: "white",
                    displayDuration:2
            });
        }
    }

    const guestPendingRequest = async (item) => {

        const updatedItem = pendingRequests.find(
            (pr) => pr._id === item._id
        );


        if (!updatedItem.guestExpiry) {
            props.displayModal({
                text: "You must set an access-expiry date and time for this guest",
                displayDuration: 2,
                backgroundColor: "red",
                textColor: "white"
            });
            return;
        }

        if (new Date(updatedItem.guestExpiry) <= new Date()) {
            props.displayModal({
                text: "Access-expiry date and time must be ahead of current date and time",
                displayDuration: 2,
                backgroundColor: "red",
                textColor: "white"
            });
            return;
        }

        try {
            const familyId = await AsyncStorage.getItem("familyId");
            const response = await fetch("http://localhost:5000/api/dashboard/guestPendingRequest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ familyId, userId: updatedItem._id, memberEmail: updatedItem.memberEmail, expiresAt:updatedItem.guestExpiry })
            });
            if (!response.ok) {
                //display error modal
                props.displayModal({
                    text: `An error occured while approving ${item.memberName} as a guest`,
                    backgroundColor: "red",
                    textColor: "white",
                    displayDuration:2
                });
                return;
            }

            //display success modal
            props.displayModal({
                    text: `${item.memberName} has been successfully added as a guest`,
                    backgroundColor: "green",
                    textColor: "white",
                    displayDuration:2
                });


            // const tempGuests = [...currentGuests];
            // tempGuests.push(updatedItem);
            // setCurrentGuests(tempGuests);
            // const tempPendingRequests = pendingRequests.filter((r) => r._id !== item._id);
            // setPendingRequests(tempPendingRequests);


            getMembersAndRequests();
        }
        catch (error) {
            console.log(error);
            //display error modal
            props.displayModal({
                    text: `An internal server error occured while approving ${item.memberName} as a guest`,
                    backgroundColor: "red",
                    textColor: "white",
                    displayDuration:2
                });
        }
    }

    const rejectPendingRequest = async (item) => {
        try {
            const familyId = await AsyncStorage.getItem("familyId");
            const response = await fetch("http://localhost:5000/api/dashboard/rejectPendingRequest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ familyId, memberEmail: item.memberEmail })
            });
            if (!response.ok) {
                //display error modal
                props.displayModal({
                    text: `An error occured while rejecting this pending request`,
                    backgroundColor: "red",
                    textColor: "white",
                    displayDuration:2
                });
                return;
            }

            // display success modal
            // props.displayModal({
            //         text: `An error occured while approving ${item.memberName} as a guest`,
            //         backgroundColor: "red",
            //         textColor: "white",
            //         displayDuration:2
            //     });

            // const tempRejectedRequests = [...rejectedRequests];
            // tempRejectedRequests.push(item);
            // setRejectedRequests(tempRejectedRequests);
            // const tempPendingRequests = pendingRequests.filter((r) => r._id !== item._id);
            // setPendingRequests(tempPendingRequests);


            getMembersAndRequests();
        }
        catch (error) {
            console.log(error);
            //display error modal
            props.displayModal({
                    text: `An error occured while rejecting this pending request`,
                    backgroundColor: "red",
                    textColor: "white",
                    displayDuration:2
                });
        }
    }


    const universalDelete = async (userId) => {
        try {
            const familyId = await AsyncStorage.getItem("familyId");
            const response = await fetch("http://localhost:5000/api/dashboard/universalMemberDelete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userId, familyId })
            });

            if (!response.ok) {
                //display error modal
                props.displayModal({
                    text: "An error occured while deleting this user. Please try again",
                    textColor: "white",
                    backgroundColor: "red",
                    displayDuration: 2.5
                });
            }

            //display success modal
            
            getMembersAndRequests();
        }
        catch (error) {
            console.log("An error occured during universal delete : ");
            console.log(error);
            //display error modal
        }
    }

    const restoreRejectedRequest = async (userId) => {
        try {
            const familyId = await AsyncStorage.getItem("familyId");
            const response = await fetch("http://localhost:5000/api/dashboard/restoreToPending", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userId, familyId })
            });

            if (!response.ok) {
                //display error modal
                props.displayModal({
                    text: "An error occured while restoring rejected request to pending list. Please try again",
                    textColor: "white",
                    backgroundColor: "red",
                    displayDuration: 2.5
                });
            }

            //display success modal
            props.displayModal({
                text: "Rejected request restored to pending list successfully",
                textColor: "white",
                backgroundColor: "green",
                displayDuration:1.5
            })
            getMembersAndRequests();
        }
        catch (error) {
            console.log("An error occured during restoration to pending list : ");
            console.log(error);
            //display error modal
        }
    }


    const updateExpiry = async (userId, updatedExpiry) => {


        

        if (new Date(updatedExpiry) <= new Date()) {
            props.displayModal({
                text: "Access-expiry date and time must be ahead of current date and time",
                displayDuration: 2,
                backgroundColor: "red",
                textColor: "white"
            });
            return;
        }


        try {
            const familyId = await AsyncStorage.getItem("familyId");
            const response = await fetch("http://localhost:5000/api/dashboard/updateGuestExpiry", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userId, familyId, updatedGuestExpiry: updatedExpiry })
            });

            if (!response.ok) {
                //display error modal
                props.displayModal({
                    text: "An error occcured while udpating access expiry for this guest. Please try again",
                    textColor: "white",
                    backgroundColor: "red",
                    displayDuration: 2.5
                });
            }

            //display success modal
            props.displayModal({
                text: "Access expiry for this guest was successfully updated",
                textColor: "white",
                backgroundColor: "green",
                displayDuration:2
            })
            getMembersAndRequests();
        }
        catch (error) {
            console.log("An error occured while updating guest expiry : ");
            console.log(error);
            //display error modal
        }
    }


    const selectFamily = () => {
        setShowFamily(true);

        Animated.timing(familyIndicatorX, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true
        }).start();
    }

    const selectGuests = () => {
        setShowFamily(false);

        Animated.timing(familyIndicatorX, {
            toValue: toggleWidth/2,
            duration: 250,
            useNativeDriver: true
        }).start();
    }


    const selectPending = () => {
        setShowPending(true);

        Animated.timing(pendingIndicatorX, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true
        }).start();
    }

    const selectRejected = () => {
        setShowPending(false);

        Animated.timing(pendingIndicatorX, {
            toValue: toggleWidth/2,
            duration: 250,
            useNativeDriver: true
        }).start();
    }


    const renderExpirySetter = (id) => {
        setPendingRequests((previousRequests) => 
            previousRequests.map((request) => request._id === id ? { ...request, showExpirySetter: true } : request)
        );
    }

    const removeExpirySetter = (id) => {
        setPendingRequests((previousRequests) => 
            previousRequests.map((request) => request._id === id ? { ...request, showExpirySetter: false } : request)
        );
    }


    useEffect(() => {
        getFamilyCode();
        getMembersAndRequests();
    }, []);

    const styles = StyleSheet.create({
        membersAndRequestsContainer: {
            width: "100%",
            height: "100%",
            // border: "1px solid white"
        },
        sampleText: {
            color:"white"
        },
        membersAndRequestsToggleContainer: {
            // border: "1px solid white",
            width: "100%",
            height: "30%",
            display: "flex",
            justifyContent: "space-around",
            alignItems:"center"
        },
        membersAndRequestsToggle: {
            border: "1px none white",
            height: 40,
            width: "90%",
            borderRadius: 10,
            overflow: "hidden",
            display: "flex",
            flexDirection: "row",
            // marginBottom:40
        },
        selectedMembersOption: {
            backgroundColor: "rgb(255, 196, 0)",
            width: "50%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        selectedRequestsOption: {
            backgroundColor: "rgb(255, 196, 0)",
            width: "50%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        membersOption: {
            width: "50%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        requestsOption: {
            width: "50%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // border:"1px solid white"
        },
        selectedRequestsOptionText: {
            color: "black",
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize:13
        },
        selectedMembersOptionText: {
            color: "black",
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize:13
        },
        requestsOptionText: {
            color: "rgb(255, 196, 0)",
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize:13
        },
        membersOptionText: {
            color: "rgb(255, 196, 0)",
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize:13
        },
        familyAndGuestsToggle: {
            width: "90%",
            // border: "1px solid white",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: 40,
            overflow:"hidden"
        },
        selectedFamilyOption: {
            border: "3px solid blueviolet",
            borderRadius: 10,
            height: 40,
            width: "45%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        selectedGuestsOption: {
            border: "3px solid blueviolet",
            borderRadius: 10,
            height: 40,
            width: "45%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        selectedFamilyOptionText: {
            fontFamily: "Helvetica",
            color: "blueviolet",
            fontWeight: 700,
            fontSize:13
        },
        selectedGuestsOptionText: {
            fontFamily: "Helvetica",
            color: "blueviolet",
            fontWeight: 700,
            fontSize:13
        },
        familyOption: {
            border: "2px solid white",
            borderRadius: 10,
            height: 40,
            width: "45%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        guestsOption: {
            border: "2px solid white",
            borderRadius: 10,
            height: 40,
            width: "45%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        familyOptionText: {
            fontFamily: "Helvetica",
            color: "white",
            fontWeight: 700,
            fontSize:13
        },
        guestsOptionText: {
            fontFamily: "Helvetica",
            color: "white",
            fontWeight: 700,
            fontSize:13
        },
        secondaryOption: {
            borderBottomColor: "white",
            borderBottomWidth: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "50%",
            height: "100%",
            // overflow:"hidden"
        },
        secondaryOptionText: {
            fontFamily: "Times New Roman",
            fontSize: 15,
            color: "white",
            fontWeight: 700,
            position:"relative"
        },
        roundedRectangle: {
            width: "50%",
            height: 10,
            backgroundColor: "white",
            position: "absolute",
            bottom: -5,
            left:0,
            borderRadius: 10
        },
        pendingAndRejectedToggle: {
            width: "90%",
            // border: "1px solid white",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: 40,
            overflow:"hidden"
        },
        listsDisplay: {
            // border: "1px solid white",
            width: "100%",
            height: "70%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "scroll",
            // paddingTop:10
        },
        pendingRequestsDisplay: {
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // paddingTop:50
            // border:"1px solid white"
        },
        pendingRequestsFlatlist: {
            // display: "flex",
            // justifyContent: "center",
            // alignItems: "center",
            width: "100%",
            // height: "100%",
            // paddingTop:10
        },
        singlePendingRequest: {
            backgroundColor: "gray",
            borderRadius: 10,
            // height: 300,
            marginBottom: 40,
            padding: 10,
            width: "90%",
            alignSelf:"center"
        },
        pendingRequestName: {
            fontFamily: "Helvetica",
            fontSize: 17,
            fontWeight: 900,
            color:"black"
        },
        pendingRequestEmailContainer: {
            width: "100%",
            display: "flex",
            flexDirection: "row",
            height: 17.5,
            alignItems: "center",
            marginTop:5
        },
        emailIcon: {
            height: 20,
            width: 20,
            marginRight:5
        },
        pendingRequestEmail: {
            fontFamily: "Helvetica",
            fontSize: 12,
            fontWeight: 700,
            color:"black"
        },
        pendingRequestPhoneContainer: {
            width: "100%",
            display: "flex",
            flexDirection: "row",
            height: 17.5,
            alignItems: "center",
            marginTop:5
            // border:"1px solid black"
        },
        phoneIcon: {
            height: 20,
            width: 20,
            marginRight:5
        },
        pendingRequestPhone: {
            fontFamily: "Helvetica",
            fontSize: 12,
            fontWeight: 700,
            color:"black"
        },
        singlePendingRequestButtonsSection: {
            marginTop:10,
            height: 100,
            width: "100%",
            // border:"1px solid black"
        },
        singlePendingRequestGuestButtonContainer: {
            height: 50,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            // border:"1px solid black"
        },
        singlePendingRequestGuestButton: {
            // width: "40%",
            padding:10,
            height: 30,
            backgroundColor: "rgb(255, 162, 0)",
            borderRadius: 5,
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        singlePendingRequestGuestButtonText: {
            fontFamily: "Helvetica",
            fontSize: 11,
            fontWeight:900,
            color: "black",
            // fontWeight:600
        },
        singlePendingRequestRemainingButtonsContainer: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            height: 50,
            width:"100%",
            // border:"1px solid black"
        },
        singlePendingRequestRejectButton: {
            width: "30%",
            // padding:10,
            height: 30,
            borderRadius: 5,
            backgroundColor: "rgb(200,0,0)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginRight:10
        },
        singlePendingRequestRejectButtonText: {
            fontFamily: "Helvetica",
            fontSize: 11,
            color: "black",
            fontWeight:900
        },
        singlePendingRequestMemberButton: {
            // width: "60%",
            padding: 10,
            // boxSizing:"border-box",
            height: 30,
            borderRadius: 5,
            backgroundColor: "rgb(0,140,0)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign:"center"
        },
        singlePendingRequestMemberButtonText: {
            fontFamily: "Helvetica",
            fontSize: 12,
            color: "black",
            fontWeight: 900,
            textAlign:"center"
        },
        expirySetter: {
            width: "100%",
            height: 100,
            marginTop:10,
            display: "flex",
            // flexDirection:"row",
            justifyContent:"center",
            alignItems: "center",
            // border:"1px solid black"
        },
        expirySetterContent: {
            display: "flex",
            flexDirection: "row",
            // border: "1px solid black",
            width:"100%"
        },
        expirySetterTitle: {
            fontFamily: "Helvetica",
            color: "black",
            fontWeight: 900,
            fontSize: 14,
            marginBottom:5
        },
        expirySetterQuestion: {
            fontFamily: "Helvetica",
            color: "black",
            fontWeight: 600,
            fontSize: 12,
            width: "40%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            // alignItems:"center",
            // border:"1px solid black"
        },
        dateTimePicker: {
            border: "1px none black",
            borderRadius:5,
            // marginTop: 10,
            width: "90%",
            height: 20,
            // backgroundColor: "black",
            // color: "ye",
            fontFamily: "Courier",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding:5
        },
        expirySetterNonText: {
            width: "60%",
            height: "100%",
            // border: "1px solid black",
            display: "flex",
            // justifyContent: "center",
            alignItems:"center"
        },
        expirySetterButtons: {
            display: "flex",
            flexDirection: "row",
            width: "100%",
            // height:"100%",
            justifyContent: "space-around",
            alignItems: "center",
            marginTop:10
        },
        cancelExpirySettingButton: {
            backgroundColor: "red",
            borderRadius: 5,
            width: "30%",
            height: 25,
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        cancelExpirySettingButtonText: {
            fontFamily: "Helvetica",
            fontWeight: 900,
            fontSize: 11,
            color: "black",
            textAlign:"center"
        },
        setGuestExpiryButton: {
            backgroundColor: "rgb(255, 174, 0)",
            borderRadius: 5,
            width: "60%",
            height: 25,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        setGuestExpiryButtonText: {
            fontFamily: "Helvetica",
            fontWeight: 900,
            fontSize: 11,
            color: "black",
            textAlign:"center"
        },
        rejectedRequestsDisplay: {
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // paddingTop:50
            // border:"1px solid white"
        },
        rejectedRequestsFlatlist: {
            width: "100%",
            // border: "1px solid white",
            display: "flex",
            justifyContent:"center"
        },
        singleRejectedRequest: {
            backgroundColor: "rgb(180,0,0)",
            borderRadius: 10,
            padding: 10,
            width: "90%",
            marginBottom: 30,
            alignSelf:"center"
        },
        singleRejectedRequestName: {
            fontFamily: "Helvetica",
            fontSize: 14,
            fontWeight: 900,
            color: "white",
            marginBottom:5
        },
        singleRejectedRequestEmail: {
            fontFamily: "Helvetica",
            fontSize: 12,
            fontWeight: 700,
            color: "white",
            margniBottom:5
        },
        singleRejectedRequestPhone: {
            fontFamily: "Helvetica",
            fontSize: 12,
            fontWeight: 700,
            color:"white"
        },
        singleRejectedRequestButtonsSection: {
            height: 80,
            width:"100%",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
            padding: 5,
            // border:"1px solid white"
        },
        deletePermanentlyButton: {
            display: "flex",
            flexDirection:"row",
            justifyContent: "space-around",
            alignItems: "center",
            width: "50%",
            height: 25,
            borderRadius: 5,
            backgroundColor:"white"
        },
        deleteIcon: {
            height: 20,
            width:20
        },
        deletePermanentlyButtonText: {
            color: "red",
            fontFamily: "Helvetica",
            fontWeight: 900,
            fontSize:11
        },
        restoreToPendingButton: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "50%",
            height: 25,
            borderRadius: 5,
            backgroundColor:"white"
        },
        restoreToPendingButtonText: {
            color: "blue",
            fontFamily: "Helvetica",
            fontWeight: 900,
            fontSize:11
        },
        singleRejectedRequestNote: {
            width: "100%",
            fontFamily: "Helvetica",
            fontWeight: 200,
            color: "white",
            fontSize:10
        },
        familyMembersDisplay: {
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // paddingTop:50
            // border:"1px solid white"
        },
        singleFamilyMember: {
            backgroundColor: "rgb(0,130,0)",
            padding: 10,
            borderRadius: 10,
            width: "90%",
            alignSelf: "center",
            display: "flex",
            flexDirection: "row",
            marginBottom:20
        },
        singleFamilyMemberDetailsSection: {
            width:"90%"
        },
        singleFamilyMemberName: {
            fontFamily: "Helvetica",
            fontWeight: 900,
            fontSize: 14,
            marginBottom: 5,
            // color:"white"
        },
        singleFamilyMemberDetailsToggle: {

        },
        singleFamilyMemberDetailsToggleText: {
            fontStyle: "italic",
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 5,
            color:"black"
        },
        memberDetails: {
            
        },
        singleFamilyMemberEmailSection: {
            display: "flex",
            flexDirection: "row",
            alignItems:"center"
        },
        singleFamilyMemberEmail: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize: 12,
            // color:"white"
        },
        singleFamilyMemberPhoneSection: {
            display: "flex",
            flexDirection:"row",
            alignItems:"center"
        },
        singleFamilyMemberPhone: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize: 12,
            // color:"white"
        },
        singleFamilyMemberDeleteSection: {
            width: "10%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        memberDeleteIcon: {
            height: 30,
            width:30
        },
        guestsDisplay: {
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // paddingTop:50
            // border:"1px solid white"
        },
        guestsToggle: {
            width: "100%",
            height: "15%",
            // border: "1px solid white",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems:"center"
        },
        selectedGuestToggleText: {
            fontSize: 17,
            fontFamily: "Courier",
            // fontStyle:"Cursive",
            fontWeight: 800,
            color: "orange",
            // borderBottomColor: "orange",
            // borderBottomWidth: 2
            // textDecorationLine:"underline"
        },
        guestToggleText: {
            fontSize: 17,
            fontFamily: "Courier",
            fontWeight: 800,
            color: "white",
            // textDecorationLine:"underline"
        },
        guestsToggleOption: {
            // border: "1px solid white",
            padding: 10,
            width: "45%",
            display: "flex",
            justifyContent:"center",
            alignItems:"center"
        },
        selectedGuestsToggleOption: {
            border: "2px solid orange",
            borderRadius:10,
            padding: 10,
            width: "45%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        currentGuestsDisplay: {
            width: "100%",
            height: "85%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // paddingTop:50
            // border:"1px solid white"
        },
        singleCurrentGuest: {
            padding: 10,
            backgroundColor: "rgb(228, 160, 0)",
            borderRadius: 10,
            display: "flex",
            flexDirection: "row",
            width: "90%",
            alignSelf: "center",
            marginBottom:30
        },
        singleCurrentGuestDetailsSection: {
            width: "90%"
        },
        singleCurrentGuestName: {
            fontFamily: "Helvetica",
            fontSize: 14,
            fontWeight:900,
            marginBottom:5
        },
        singleCurrentGuestEmailSection: {
            display: "flex",
            flexDirection: "row",
            alignItems:"center"
        },
        singleCurrentGuestEmail: {
            fontFamily: "Helvetica",
            fontSize: 12,
            fontWeight:700
        },
        singleCurrentGuestPhoneSection: {
            display: "flex",
            flexDirection: "row",
            alignItems:"center"
        },
        singleCurrentGuestPhone: {
            fontFamily: "Helvetica",
            fontSize: 12,
            fontWeight:700
        },
        singleCurrentGuestExpirySection: {
            marginTop:10
        },
        singleCurrentGuestAccessUntil: {
            fontFamily: "Helvetica",
            fontSize: 12,
            fontWeight:700
        },
        singleCurrentGuestExpiry: {
            fontFamily: "Helvetica",
            fontSize: 13,
            fontWeight: 700,
            color: "blue",
            marginRight:5
        },
        singleCurrentGuestExpiryDisplay: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop:5
        },
        singleCurrentGuestEditPencil: {
            height: 20,
            width: 20,
            position: "relative",
            bottom:5
        },
        singleCurrentGuestDeleteSection: {
            width: "10%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        singleCurrentGuestCancelExpiryEditButton: {
            backgroundColor: "rgb(180,0,0)",
            borderRadius: 5,
            padding: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "40%",
            // marginTop:20
        },
        singleCurrentGuestCancelExpiryEditButtonText: {
            color: "white",
            fontFamily: "Helvetica",
            fontSize: 12,
            fontWeight:900
        },
        singleCurrentGuestEditExpiryButton: {
            backgroundColor: "white",
            borderRadius: 5,
            padding: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "40%",
            marginLeft:10
        },
        singleCurrentGuestEditExpiryButtonText: {
            color: "rgb(228, 160, 0)",
            fontFamily: "Helvetica",
            fontSize: 12,
            fontWeight:900
        },
        currentGuestDateTimePicker: {
            border: "1px none black",
            borderRadius:5,
            // marginTop: 10,
            width: "70%",
            height: 30,
            // backgroundColor: "black",
            // color: "ye",
            fontFamily: "Courier",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // padding:5
        },
        singleCurrentGuestEditExpirySection: {
            // border:"1px solid black",
            marginTop:20
        },
        singleCurrentGuestEditExpiryButtonsSection: {
            display: "flex",
            // border: "1px solid black",
            flexDirection: "row",
            marginTop:10
        },
        pastGuestsDisplay: {
            width: "100%",
            height: "85%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // paddingTop:50
            // border:"1px solid white"
        },
        singlePastGuest: {
            backgroundColor: "rgb(255, 219, 112)",
            borderRadius: 10,
            padding: 10,
            display: "flex",
            flexDirection: "row",
            width: "90%",
            alignSelf: "center",
            marginBottom:40
        },
        singlePastGuestDetailsSection: {
            width:"90%"
        },
        singlePastGuestName: {
            fontFamily: "Helvetica",
            fontWeight: 900,
            fontSize:14
        },
        singlePastGuestEmailSection: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop:5
        },
        singlePastGuestEmail: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize:12
        },
        singlePastGuestPhoneSection: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            // marginTop:2
        },
        singlePastGuestPhone: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize:12
        },
        accessExpiredOnText: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize: 12,
            marginTop:10
        },
        singlePastGuestExpiry: {
            fontFamily: "Helvetica",
            fontWeight: 900,
            fontSize: 13,
            color:"red"
        },
        revokeAccessSection: {
            marginTop: 10,
            // border:"1px solid black"
        },
        revokeAccessButton: {
            backgroundColor: "white",
            borderRadius: 5,
            padding: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width:"50%"
        },
        revokeAccessButtonText: {
            color: "rgb(255, 98, 0)",
            fontFamily: "Helvetica",
            fontSize: 12,
            fontWeight:900
        },
        revokeAccessExpiryInputSection: {
            display: "flex",
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            // border:"1px solid black"
        },
        revokeAccessUntilWhenQuestion: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize: 12,
            width:"30%"
        },
        singlePastGuestDateTimePicker: {
            width: "70%",
            border: "1px none black",
            borderRadius:5,
            // marginTop: 10,
            // width: "70%",
            height: 30,
            // backgroundColor: "black",
            // color: "ye",
            fontFamily: "Courier",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // padding:5
        },
        revokeAccessButtonsSection: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: 20,
            justifyContent:"space-around"
        },
        revokeAccessCancelButton: {
            backgroundColor: "rgb(250,0,0)",
            borderRadius: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 5,
            width:"40%"
        },
        revokeAccessCancelButtonText: {
            fontFamily: "Helvetica",
            fontWeight: 900,
            fontSize:12
        },
        revokeAccessConfirmButton: {
            backgroundColor:"white",
            borderRadius: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 5,
            width:"50%"
        },
        revokeAccessConfirmButtonText: {
            fontFamily: "Helvetica",
            fontWeight: 900,
            fontSize: 12,
            color:"rgb(255, 98, 0)"
        },
        singlePastGuestDeleteSection: {
            width: "10%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        familyCodeContainer: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // border:"1px solid white"
        },
        familyCodeDisplay: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            // border: "1px solid white",
            width:"100%"
        },
        familyCodeIntroText: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            color: "white",
            fontSize:16
        },
        familyCodeText: {
            fontFamily: "Helvetica",
            fontWeight: 900,
            color: "yellow",
            fontSize: 20,
            marginLeft:5
        },
        familyCodeOutroText: {
            fontFamily: "Helvetica",
            fontWeight: 500,
            color: "white",
            fontSize: 12,
            marginTop:5
        },
        isLoadingScreen: {
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        loadingAnimationContainer: {
            height: 200,
            width: 200,
            // border:"1px solid white"
        },
        loadingText: {
            color: "#ffc800",
            fontSize: 15,
            fontFamily: "Helvetica",
            fontWeight: 400,
            marginTop:50
        },
        errorOccuredScreen: {
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        errorIcon: {
            height: 50,
            width: 50,
            marginBottom:30
        },
        errorOccuredText: {
            color: "gray",
            fontFamily: "Helvetica",
            fontSize: 13,
            fontWeight:700
        },
        errorOccuredLink: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            color: "blue",
            fontSize: 13,
            marginTop:10
        },
        zeroItemsDisplay: {
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // paddingTop:50
            // border:"1px solid white"
        },
        smallerZeroItemsDisplay: {
            width: "100%",
            height: "85%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // paddingTop:50
            // border:"1px solid white"
        },
        zeroItemsText: {
            color: "gray",
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize:13
        }
    });


    if (isLoading) {
        return (
            <View style={styles.isLoadingScreen}>
            <View style={styles.loadingAnimationContainer}>
                            <LottieView
                                source={require("./../../Animations/ThunderBolt.json")}
                                autoPlay
                                loop
                                style={styles.loadingAnimation}
                            renderMode="SVG"/>
                            </View>
            <Text style={styles.loadingText}>Loading your lists...</Text>
            </View>
        )
    }


    else if (errorOccured) {
        return (
            <View style={styles.errorOccuredScreen}>
                <Image source={require("./../../assets/error-16-svgrepo-com.png")} style={styles.errorIcon} />
                <Text style={styles.errorOccuredText}>An error occured while fetching your lists</Text>
                <Pressable
                    style={styles.errorOccouredPressable}
                    onPress={() => {
                        setIsLoading(true);
                        getMembersAndRequests();
                    }}>
                    <Text style={styles.errorOccuredLink}>Tap here to try again</Text>
                </Pressable>
            </View>
        )
    }
    

    else {
        return (
            <View style={styles.membersAndRequestsContainer}>

                {/* <Text style={styles.sampleText}>
                This is the members and requests screen
            </Text> */}

                <View style={styles.membersAndRequestsToggleContainer}>


                    <View style={styles.familyCodeContainer}>
                        <View style={styles.familyCodeDisplay}>
                            <Text style={styles.familyCodeIntroText}>Your family code is : </Text>
                            <Text style={styles.familyCodeText}>{familyCode}</Text>
                        </View>
                        <Text style={styles.familyCodeOutroText}>Share this with users who wish to join your family</Text>
                    </View>


                    <View style={styles.membersAndRequestsToggle}>
                    
                        <Pressable style={showMembers ? styles.selectedMembersOption : styles.membersOption} onPress={() => setShowMembers(true)}>
                            <Text style={showMembers ? styles.selectedMembersOptionText : styles.membersOptionText}>Approved Members</Text>
                        </Pressable>

                        <Pressable style={showMembers ? styles.requestsOption : styles.selectedRequestsOption} onPress={() => setShowMembers(false)}>
                            <Text style={showMembers ? styles.requestsOptionText : styles.selectedRequestsOptionText}>Join Requests</Text>
                        </Pressable>


                    </View>

                    {showMembers ? <View style={styles.familyAndGuestsToggle} onLayout={(event) => setToggleWidth(event.nativeEvent.layout.width)}>
                    
                        {/* <Pressable style={showFamily ? styles.selectedFamilyOption : styles.familyOption} onPress={()=>setShowFamily(true)}>
                        <Text style={showFamily ? styles.selectedFamilyOptionText : styles.familyOptionText}>Family Members</Text>
                    </Pressable>

                    <Pressable style={showFamily ? styles.guestsOption : styles.selectedGuestsOption} onPress={()=>setShowFamily(false)}>
                        <Text style={showFamily ? styles.guestsOptionText : styles.selectedGuestsOptionText}>Guests</Text>
                    </Pressable> */}

                        <Pressable style={styles.secondaryOption} onPress={selectFamily}>
                            <Text style={styles.secondaryOptionText}>Family Members</Text>
                            {/* {showFamily && <View style={styles.roundedRectangle}></View>} */}
                        </Pressable>

                        <Pressable style={styles.secondaryOption} onPress={selectGuests}>
                            <Text style={styles.secondaryOptionText}>Guests</Text>
                            {/* {!showFamily && <View style={styles.roundedRectangle}></View>} */}
                        </Pressable>

                        <Animated.View style={[styles.roundedRectangle, { transform: [{ translateX: familyIndicatorX }] }]} />

                    </View>
                        :
                        <View style={styles.pendingAndRejectedToggle}>
                            <Pressable style={styles.secondaryOption} onPress={selectPending}>
                                <Text style={styles.secondaryOptionText}>Pending</Text>
                                {/* {showPending && <View style={styles.roundedRectangle}></View>} */}
                            </Pressable>

                            <Pressable style={styles.secondaryOption} onPress={selectRejected}>
                                <Text style={styles.secondaryOptionText}>Rejected</Text>
                                {/* {!showPending && <View style={styles.roundedRectangle}></View>} */}
                            </Pressable>

                            <Animated.View style={[styles.roundedRectangle, { transform: [{ translateX: pendingIndicatorX }] }]} />

                        </View>}
                </View>


                <View style={styles.listsDisplay}>
                    {showMembers ?
                    
                    
                        showFamily ?
                            
                            members.length > 0 ? <View style={styles.familyMembersDisplay}>
                                <FlatList
                                    data={members}
                                    keyExtractor={(item) => item._id}
                                    style={{ width: "100%" }}
                                    contentContainerStyle={styles.familyMembersFlatlist}
                                    renderItem={({ item }) => {
                                        return (
                                            <View style={styles.singleFamilyMember}>

                                                <View style={styles.singleFamilyMemberDetailsSection}>
                                                    <Text style={styles.singleFamilyMemberName}>{item.userId.name}</Text>

                                                    <Pressable
                                                        style={styles.singleFamilyMemberDetailsToggle}
                                                        onPress={() => {
                                                            setMembers(members.map((fm) => {
                                                                if (fm.userId._id === item.userId._id) {
                                                                    return { ...fm, showDetails: !fm.showDetails };
                                                                }
                                                                return fm;
                                                            }));
                                                        }}>
                                                        <Text style={styles.singleFamilyMemberDetailsToggleText}>{item.showDetails ? "Hide Details" : "Show Details"}</Text>
                                                    </Pressable>

                                                    {item.showDetails && <View style={styles.memberDetails}>

                                                        <View style={styles.singleFamilyMemberEmailSection}>
                                                            <Image source={require("./../../assets/email-svgrepo-com.png")} style={styles.emailIcon} />
                                                            <Text style={styles.singleFamilyMemberEmail}>{item.userId.email}</Text>
                                                        </View>


                                                        <View style={styles.singleFamilyMemberPhoneSection}>
                                                            <Image source={require("./../../assets/phone-svgrepo-com.png")} style={styles.phoneIcon} />
                                                            <Text style={styles.singleFamilyMemberPhone}>{item.userId.phone}</Text>
                                                        </View>
                                                    </View>}


                                                </View>

                                                <Pressable
                                                    style={styles.singleFamilyMemberDeleteSection}
                                                    onPress={() => {
                                                        props.displayModal({
                                                            title: "Delete User Completely ?",
                                                            text: "Are you sure you wish to remove this user from all lists ? Once this action is done, you will not be able to find them anywhere. They can, however, request access again. Tap \"delete\" below to continue.",
                                                            buttons: [{
                                                                buttonText: "CANCEL",
                                                                buttonTextColor: "black",
                                                                buttonBackgroundColor: "transparent",
                                                                onButtonClick: () => {
                                                                    props.closeModal();
                                                                }
                                                            },
                                                            {
                                                                buttonText: "DELETE",
                                                                buttonTextColor: "white",
                                                                buttonBackgroundColor: "rgb(200,0,0)",
                                                                onButtonClick: () => {
                                                                    universalDelete(item.userId._id);
                                                                    props.closeModal();
                                                                }
                                                            }]
                                                        });
                                                        // universalDelete(item.userId._id);
                                                    }}>
                                                    <Image source={require("./../../assets/delete-black-svgrepo-com.png")} style={styles.memberDeleteIcon} />
                                                </Pressable>
                                            </View>
                                        )
                                    }} />
                            </View>
                                :
                                <View style={styles.zeroItemsDisplay}>
                                    <Text style={styles.zeroItemsText}>Uh oh! No family members to display</Text>
                                </View>
                            :
                            <View style={styles.guestsDisplay}>


                                <View style={styles.guestsToggle}>
                                    <Pressable style={showCurrentGuests ? styles.selectedGuestsToggleOption : styles.guestsToggleOption} onPress={() => setShowCurrentGuests(true)}>
                                        <Text style={showCurrentGuests ? styles.selectedGuestToggleText : styles.guestToggleText}>Current Guests</Text>
                                    </Pressable>

                                    <Pressable style={showCurrentGuests ? styles.guestsToggleOption : styles.selectedGuestsToggleOption} onPress={() => setShowCurrentGuests(false)}>
                                        <Text style={showCurrentGuests ? styles.guestToggleText : styles.selectedGuestToggleText}>Past Guests</Text>
                                    </Pressable>
                                </View>


                                {showCurrentGuests ?
                                    currentGuests.length > 0 ? <View style={styles.currentGuestsDisplay}>
                                        <FlatList
                                            data={currentGuests}
                                            keyExtractor={(item) => item._id}
                                            style={{ width: "100%" }}
                                            contentContainerStyle={{ width: "100%" }}
                                            renderItem={({ item }) => {
                                                return (
                                                    <View style={styles.singleCurrentGuest}>

                                                        <View style={styles.singleCurrentGuestDetailsSection}>
                                                    
                                                            <Text style={styles.singleCurrentGuestName}>{item.userId.name}</Text>
                                                    
                                                            <View style={styles.singleCurrentGuestEmailSection}>
                                                                <Image source={require("./../../assets/email-svgrepo-com.png")} style={styles.emailIcon} />
                                                                <Text style={styles.singleCurrentGuestEmail}>{item.userId.email}</Text>
                                                            </View>

                                                            <View style={styles.singleCurrentGuestPhoneSection}>
                                                                <Image source={require("./../../assets/phone-svgrepo-com.png")} style={styles.phoneIcon} />
                                                                <Text style={styles.singleCurrentGuestPhone}>{item.userId.phone}</Text>
                                                            </View>

                                                        
                                                        
                                                    
                                                            {!item.showExpiryEditor ? <View style={styles.singleCurrentGuestExpirySection}>
                                                                <Text style={styles.singleCurrentGuestAccessUntil}>Access until :</Text>
                                                                <View style={styles.singleCurrentGuestExpiryDisplay}>

                                                                    <Text style={styles.singleCurrentGuestExpiry}>
                                                                        {new Date(item.expiresAt).toLocaleString("en-EN", {
                                                                            day: "numeric",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                            hour: "numeric",
                                                                            minute: "2-digit",
                                                                            hour12: true
                                                                        })}
                                                                    </Text>
                                                        
                                                                    <Pressable
                                                                        style={styles.singleCurrentGuestEditPencilContainer}
                                                                        onPress={() => {
                                                                            setCurrentGuests(currentGuests.map((cg) => {
                                                                                if (cg._id === item._id) {
                                                                                    return {
                                                                                        ...cg,
                                                                                        showExpiryEditor: true
                                                                                    }
                                                                                }
                                                                                return cg;
                                                                            }))
                                                                        }}>
                                                                        <Image source={require("./../../assets/edit-pencil-svgrepo-com.png")} style={styles.singleCurrentGuestEditPencil} />
                                                                    </Pressable>

                                                                </View>
                                                            </View>
                                                                :
                                                                <View style={styles.singleCurrentGuestEditExpirySection}>
                                                                    <input
                                                                        type="datetime-local"
                                                                        style={styles.currentGuestDateTimePicker}
                                                                        value={new Date(item.expiresAt).toISOString().slice(0, 16)}
                                                                        onChange={(event) => {
                                                                            const tempCurrentGuests = currentGuests.map((cg) => {
                                                                                if (cg._id === item._id) {
                                                                                    return {
                                                                                        ...cg,
                                                                                        guestExpiry: event.target.value
                                                                                    };
                                                                                }
                                                                                return cg;
                                                                            });
                                                                            setCurrentGuests(tempCurrentGuests);
                                                                        }} />
                                                            
                                                                    <View style={styles.singleCurrentGuestEditExpiryButtonsSection}>
                                                                        <Pressable
                                                                            style={styles.singleCurrentGuestCancelExpiryEditButton}
                                                                            onPress={() => {
                                                                                setCurrentGuests(currentGuests.map((cg) => {
                                                                                    if (cg._id === item._id) {
                                                                                        return {
                                                                                            ...cg,
                                                                                            showExpiryEditor: false
                                                                                        }
                                                                                    }
                                                                                    return cg;
                                                                                }))
                                                                            }}>
                                                                            <Text style={styles.singleCurrentGuestCancelExpiryEditButtonText}>Cancel</Text>
                                                                        </Pressable>

                                                                        <Pressable
                                                                            style={styles.singleCurrentGuestEditExpiryButton}
                                                                            onPress={() => updateExpiry(item.userId._id, item.expiresAt)}>
                                                                            <Text style={styles.singleCurrentGuestEditExpiryButtonText}>Edit Expiry</Text>
                                                                        </Pressable>


                                                                    </View>
                                                                </View>}
                                                        </View>
                                                
                                                        <View style={styles.singleCurrentGuestDeleteSection}>
                                                            <Pressable
                                                                style={styles.singleCurrentGuestDeleteContainer}
                                                                onPress={() => {
                                                                    props.displayModal({
                                                                        title: "Delete User Completely ?",
                                                                        text: "Are you sure you wish to remove this user from all lists ? Once this action is done, you will not be able to find them anywhere. They can, however, request access again. Tap \"delete\" below to continue.",
                                                                        buttons: [{
                                                                            buttonText: "CANCEL",
                                                                            buttonTextColor: "black",
                                                                            buttonBackgroundColor: "transparent",
                                                                            onButtonClick: () => {
                                                                                props.closeModal();
                                                                            }
                                                                        },
                                                                        {
                                                                            buttonText: "DELETE",
                                                                            buttonTextColor: "white",
                                                                            buttonBackgroundColor: "rgb(200,0,0)",
                                                                            onButtonClick: () => {
                                                                                universalDelete(item.userId._id);
                                                                                props.closeModal();
                                                                            }
                                                                        }]
                                                                    });
                                                                    // universalDelete(item.userId._id);
                                                                }}>
                                                                <Image source={require("./../../assets/delete-black-svgrepo-com.png")} style={styles.memberDeleteIcon} />
                                                            </Pressable>
                                                        </View>
                                                    </View>
                                                )
                                            }} />
                                                
                                    </View>
                                        :
                                        <View style={styles.smallerZeroItemsDisplay}>
                                            <Text style={styles.zeroItemsText}> Uh oh! No current guests to display</Text>
                                        </View>
                                    :
                                    pastGuests.length > 0 ? <View style={styles.pastGuestsDisplay}>
                                        <FlatList
                                            style={{ width: "100%" }}
                                            contentContainerStyle={{ width: "100%" }}
                                            data={pastGuests}
                                            keyExtractor={(item) => item._id}
                                            renderItem={({ item }) => {
                                                return (
                                                    <View style={styles.singlePastGuest}>
                                                        <View style={styles.singlePastGuestDetailsSection}>
                                                            <Text style={styles.singlePastGuestName}>{item.userId.name}</Text>
                                                            <View style={styles.singlePastGuestEmailSection}>
                                                                <Image source={require("./../../assets/email-svgrepo-com.png")} style={styles.emailIcon} />
                                                                <Text style={styles.singlePastGuestEmail}>{item.userId.email}</Text>
                                                            </View>
                                                            <View style={styles.singlePastGuestPhoneSection}>
                                                                <Image source={require("./../../assets/phone-svgrepo-com.png")} style={styles.phoneIcon} />
                                                                <Text style={styles.singlePastGuestPhone}>{item.userId.phone}</Text>
                                                            </View>
                                                            <Text style={styles.accessExpiredOnText}>Access expired on : </Text>
                                                            <Text style={styles.singlePastGuestExpiry}>
                                                                {new Date(item.expiresAt).toLocaleString("en-EN", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                    hour: "numeric",
                                                                    minute: "2-digit",
                                                                    hour12: true
                                                                })}
                                                            </Text>
                                                            <View style={styles.revokeAccessSection}>
                                                                {!item.showExpirySetter ? <View style={styles.revokeAccessButtonContainer}>
                                                                    <Pressable
                                                                        style={styles.revokeAccessButton}
                                                                        onPress={() => {
                                                                            setPastGuests(pastGuests.map((pg) => {
                                                                                if (pg._id === item._id) {
                                                                                    return {
                                                                                        ...pg,
                                                                                        showExpirySetter: true
                                                                                    }
                                                                                }
                                                                                return pg;
                                                                            }))
                                                                        }}>
                                                                        <Text style={styles.revokeAccessButtonText}>Revoke Access</Text>
                                                                    </Pressable>
                                                                </View>
                                                                    :
                                                                    <View style={styles.revokeAccessExpiryInput}>
                                                                        <View style={styles.revokeAccessExpiryInputSection}>
                                                                            <Text style={styles.revokeAccessUntilWhenQuestion}>Until when should this guest have access ? </Text>
                                                                            <input
                                                                                type="datetime-local"
                                                                                style={styles.singlePastGuestDateTimePicker}
                                                                                value={new Date(item.expiresAt).toISOString().slice(0, 16)}
                                                                                onChange={(event) => {
                                                                                    const tempPastGuests = pastGuests.map((pg) => {
                                                                                        if (pg._id === item._id) {
                                                                                            return {
                                                                                                ...pg,
                                                                                                expiresAt: event.target.value
                                                                                            };
                                                                                        }
                                                                                        return pg;
                                                                                    });
                                                                                    setPastGuests(tempPastGuests);
                                                                                }} />
                                                                        </View>
                                                                        <View style={styles.revokeAccessButtonsSection}>
                                                                            <Pressable
                                                                                style={styles.revokeAccessCancelButton}
                                                                                onPress={() => {
                                                                                    setPastGuests(pastGuests.map((pg) => {
                                                                                        if (pg._id === item._id) {
                                                                                            return {
                                                                                                ...pg,
                                                                                                showExpirySetter: false
                                                                                            }
                                                                                        }
                                                                                        return pg;
                                                                                    }))
                                                                                }}>
                                                                                <Text style={styles.revokeAccessCancelButtonText}>Cancel</Text>
                                                                            </Pressable>
                                                                            <Pressable
                                                                                style={styles.revokeAccessConfirmButton}
                                                                                onPress={() => updateExpiry(item.userId._id, item.expiresAt)}>
                                                                                <Text style={styles.revokeAccessConfirmButtonText}>Revoke Access</Text>
                                                                            </Pressable>
                                                                        </View>
                                                                    </View>}
                                                            </View>
                                                        </View>
                                                        <View style={styles.singlePastGuestDeleteSection}>
                                                            <Pressable
                                                                style={styles.singlePastGuestDeleteContainer}
                                                                onPress={() => {
                                                                    props.displayModal({
                                                                        title: "Delete User Completely ?",
                                                                        text: "Are you sure you wish to remove this user from all lists ? Once this action is done, you will not be able to find them anywhere. They can, however, request access again. Tap \"delete\" below to continue.",
                                                                        buttons: [{
                                                                            buttonText: "CANCEL",
                                                                            buttonTextColor: "black",
                                                                            buttonBackgroundColor: "transparent",
                                                                            onButtonClick: () => {
                                                                                props.closeModal();
                                                                            }
                                                                        },
                                                                        {
                                                                            buttonText: "DELETE",
                                                                            buttonTextColor: "white",
                                                                            buttonBackgroundColor: "rgb(200,0,0)",
                                                                            onButtonClick: () => {
                                                                                universalDelete(item.userId._id);
                                                                                props.closeModal();
                                                                            }
                                                                        }]
                                                                    });
                                                                    // universalDelete(item.userId._id)
                                                                }}>
                                                                <Image source={require("./../../assets/delete-black-svgrepo-com.png")} style={styles.memberDeleteIcon} />
                                                            </Pressable>
                                                        </View>
                                                    </View>
                                                )
                                            }} />
                                    </View>
                                        :
                                        <View style={styles.smallerZeroItemsDisplay}>
                                            <Text style={styles.zeroItemsText}>Uh oh! No past guests to display</Text>
                                        </View>}



                            </View>
                    

                        :


                        showPending ?
                            pendingRequests.length > 0 ? <View style={styles.pendingRequestsDisplay}>
                                <FlatList
                                    style={{ width: "100%" }}
                                    contentContainerStyle={styles.pendingRequestsFlatlist}
                                    data={pendingRequests}
                                    keyExtractor={(item) => item._id}
                                    renderItem={({ item }) => {
                                        return (
                                            <View style={styles.singlePendingRequest}>
                                            
                                                <Text style={styles.pendingRequestName}>{item.memberName}</Text>
                                                <View style={styles.pendingRequestEmailContainer}>
                                                    <Image source={require("./../../assets/email-svgrepo-com.png")} style={styles.emailIcon} />
                                                    <Text style={styles.pendingRequestEmail}>{item.memberEmail}</Text>
                                                </View>
                                                <View style={styles.pendingRequestPhoneContainer}>
                                                    <Image source={require("./../../assets/phone-svgrepo-com.png")} style={styles.phoneIcon} />
                                                    <Text style={styles.pendingRequestPhone}>{item.memberPhone}</Text>
                                                </View>

                                                {item.showExpirySetter ?
                                                    <View style={styles.expirySetter}>
                            
                                                        <Text style={styles.expirySetterTitle}>Set guest access expiry</Text>

                                                        <View style={styles.expirySetterContent}>
                                                            <Text style={styles.expirySetterQuestion}>Until when should this guest have access ?</Text>
                                                    
                                                            {/* <DateTimePicker
                                                        style={styles.dateTimePicker}
                                                        value={expiryDate}
                                                        mode="date"
                                                        is24Hour={false}
                                                        onChange={(event,selectedDate)=>setExpiryDate(selectedDate)} /> */}
                                                    
                                                            <View style={styles.expirySetterNonText}>

                                                                <input
                                                                    type="datetime-local"
                                                                    style={styles.dateTimePicker}
                                                                    onChange={(event) => {
                                                                        const tempPendingRequests = pendingRequests.map((pr) => {
                                                                            if (pr._id === item._id) {
                                                                                return {
                                                                                    ...pr,
                                                                                    guestExpiry: event.target.value
                                                                                };
                                                                            }
                                                                            return pr;
                                                                        });
                                                                        setPendingRequests(tempPendingRequests);
                                                                    }} />
                                                            
                                                            
                                                                <View style={styles.expirySetterButtons}>
                                                                    <Pressable style={styles.cancelExpirySettingButton} onPress={() => removeExpirySetter(item._id)}>
                                                                        <Text style={styles.cancelExpirySettingButtonText}>Cancel</Text>
                                                                    </Pressable>
                                                                    <Pressable style={styles.setGuestExpiryButton} onPress={() => guestPendingRequest(item)}>
                                                                        <Text style={styles.setGuestExpiryButtonText}>Approve Guest</Text>
                                                                    </Pressable>
                                                                </View>
                                                            </View>
                                                        </View>

                                                    </View>
                                                    :
                                                    <View style={styles.singlePendingRequestButtonsSection}>
                                                        <View style={styles.singlePendingRequestGuestButtonContainer}>
                                                            <Pressable style={styles.singlePendingRequestGuestButton} onPress={() => renderExpirySetter(item._id)}>
                                                                <Text style={styles.singlePendingRequestGuestButtonText}>
                                                                    Approve as Guest
                                                                </Text>
                                                            </Pressable>
                                                        </View>
                                                        <View style={styles.singlePendingRequestRemainingButtonsContainer}>
                                                            <Pressable style={styles.singlePendingRequestRejectButton} onPress={() => rejectPendingRequest(item)}>
                                                                <Text style={styles.singlePendingRequestRejectButtonText}>
                                                                    Reject
                                                                </Text>
                                                            </Pressable>
                                                            <Pressable style={styles.singlePendingRequestMemberButton} onPress={() => memberPendingRequest(item)}>
                                                                <Text style={styles.singlePendingRequestMemberButtonText}>
                                                                    Approve as Family Member
                                                                </Text>
                                                            </Pressable>
                                                        </View>
                                                    </View>}


                                            </View>
                                        )
                                    }} />
                            </View>
                                :
                                <View style={styles.zeroItemsDisplay}>
                                    <Text style={styles.zeroItemsText}>Uh oh! No pending requests to display</Text>
                                </View>
                            :
                            rejectedRequests.length > 0 ? <View style={styles.rejectedRequestsDisplay}>
                                <FlatList
                                    style={{ width: "100%" }}
                                    contentContainerStyle={styles.rejectedRequestsFlatlist}
                                    data={rejectedRequests}
                                    keyExtractor={(item) => item._id}
                                    renderItem={({ item }) => {
                                        return (
                                            <View style={styles.singleRejectedRequest}>
                                                <Text style={styles.singleRejectedRequestName}>{item.memberName}</Text>
                                                <Text style={styles.singleRejectedRequestEmail}>{item.memberEmail}</Text>
                                                <Text style={styles.singleRejectedRequestPhone}>{item.memberPhone}</Text>

                                                <View style={styles.singleRejectedRequestButtonsSection}>


                                                    <Pressable
                                                        style={styles.restoreToPendingButton}
                                                        onPress={() => restoreRejectedRequest(item._id.toString())}>
                                                        <Text style={styles.restoreToPendingButtonText}>Restore to Pending List</Text>
                                                    </Pressable>


                                                    <Pressable
                                                        style={styles.deletePermanentlyButton}
                                                        onPress={() => {
                                                            props.displayModal({
                                                                title: "Delete User Completely ?",
                                                                text: "Are you sure you wish to remove this user from all lists ? Once this action is done, you will not be able to find them anywhere. They can, however, request access again. Tap \"delete\" below to continue.",
                                                                buttons: [{
                                                                    buttonText: "CANCEL",
                                                                    buttonTextColor: "black",
                                                                    buttonBackgroundColor: "transparent",
                                                                    onButtonClick: () => {
                                                                        props.closeModal();
                                                                    }
                                                                },
                                                                {
                                                                    buttonText: "DELETE",
                                                                    buttonTextColor: "white",
                                                                    buttonBackgroundColor: "rgb(200,0,0)",
                                                                    onButtonClick: () => {
                                                                        universalDelete(item._id.toString());
                                                                        props.closeModal();
                                                                    }
                                                                }]
                                                            });
                                                            // universalDelete(item._id.toString())
                                                        }}>
                                                        <Image source={require("./../../assets/delete-2-svgrepo-com.png")} style={styles.deleteIcon} />
                                                        <Text style={styles.deletePermanentlyButtonText}>Delete Permanently</Text>
                                                    </Pressable>



                                                
                                                </View>

                                                <Text style={styles.singleRejectedRequestNote}>
                                                    Note : In order to approve this person as a family member or guest, they must be restored to pending list first
                                                </Text>
                                            </View>
                                        )
                                    }} />
                            </View>
                                :
                                <View style={styles.zeroItemsDisplay}>
                                    <Text style={styles.zeroItemsText}>Uh oh! No rejected requests to display</Text>
                                </View>
                    }
                </View>




            </View>
        )
    }
}