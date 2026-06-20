import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    Pressable,
    Animated
} from "react-native";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


import SwitchesAndGroups from "./Dashboard-Components/SwitchesAndGroups.js";
import SwitchGroupManager from "./Dashboard-Components/SwitchGroupManager.js";
import MembersAndRequests from "./Dashboard-Components/MembersAndRequests.js";
import FamilySwitcher from "./Dashboard-Components/FamilySwitcher.js";
import ProfileEditor from "./Dashboard-Components/ProfileEditor.js";
import PasswordChanger from "./Dashboard-Components/PasswordChanger.js";



export default function UserDashboard({ navigation }) {


    const defaultModalState = {
        showModal: false,
        displayDuration: 0, //in SECONDS, not milliseconds
        buttons: [],
        // expected format of a single object element or button:
        // {
        //     buttonText: String,
        //     buttonTextColor: String,
        //     buttonBackgroundColor: String,
        //     onButtonClick: callback
        // }
        title: "",
        titleColor: "black",
        text: "",
        textColor: "black",
        backgroundColor: "gray",
        showIcon: false,
        iconPath: ""
    };

    const trialModalState = {
        showModal: true,
        displayDuration: 0,
        buttons: [
            {
                buttonText: "CANCEL",
                buttonTextColor: "black",
                buttonBackgroundColor: "transparent",
                onButtonClick: () => {
                    closeModal();
                }
            },
            {
                buttonText: "DELETE",
                buttonTextColor: "white",
                buttonBackgroundColor: "red",
                onButtonClick: () => {
                    closeModal();
                    console.log("Delete button was clicked");
                }
            }
        ],
        title: "Sample modal",
        titleColor: "black",
        text: "This is a sample modal. Clicking either of the buttons below will do nothing. Please make note that this modal's properties are being stored in a separate object altogether",
        textColor: "black",
        backgroundColor: "gray",
        showIcon: true,
        iconPath: require("./../assets/add-square-svgrepo-com.png")
    };

    const drawerX = useRef(new Animated.Value(-300)).current;


    const [dashboardContent, setDashboardContent] = useState("switches");

    const [name, setName] = useState("Kanishk Sanadi");

    const [switchGroup, setSwitchGroup] = useState();

    const [switches, setSwitches] = useState();

    const [modal, setModal] = useState(defaultModalState);

    const [drawerOpen, setDrawerOpen] = useState(false);

    const openDrawer = () => {
        setDrawerOpen(true);

        Animated.timing(drawerX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
        }).start();
    }

    const closeDrawer = () => {
        Animated.timing(drawerX, {
            toValue: -300,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            setDrawerOpen(false);
        });
    }

    const closeModal = () => {
        setModal(defaultModalState);
    }

    const displayModal = (modalObject) => {

        if (modal.showModal) {
            return;
        }
        
        const finalModal = {
            ...defaultModalState,
            ...modalObject,
            showModal:true
        };

        setModal(finalModal);

        if (finalModal.buttons.length === 0 && finalModal.displayDuration > 0) {
            setTimeout(() => {
                closeModal();
            }, finalModal.displayDuration * 1000);
        }

    };


    const handleLogout = () => {
        console.log("A logout request was generated");
        closeDrawer();
        displayModal({
            title: "Log Out ?",
            text: "Are you sure you want to log out ?",
            buttons: [{
                buttonText: "CANCEL",
                buttonTextColor: "black",
                buttonBackgroundColor: "transparent",
                onButtonClick: () => {
                    closeModal();
                }
            },
            {
                buttonText: "Log Out",
                buttonTextColor: "white",
                buttonBackgroundColor: "rgb(200,0,0)",
                onButtonClick: () => {
                    navigation.goBack();
                    closeModal();
                }
            }]
        });
    }


    


    const fetchUsernameAndFamily = async () => {
        try {
            console.log("Getting username and family ID...");
            const accessToken = await AsyncStorage.getItem("accessToken");
            const email = await AsyncStorage.getItem("email");
            console.log("Access token is : ");
            console.log(accessToken);
            console.log(email);
            const response = await fetch("http://localhost:5000/api/dashboard/getUserDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization" : `bearer ${accessToken}`
                },
                body: JSON.stringify({email})
            });
            if (!response.ok) {
                //show that an error occured while loading user details
                return;
            }
            setName("Kanishk Sanadi");
            const data = await response.json();
            // console.log(data);
            // console.log(data.name);
            // setName(data.name);
            await AsyncStorage.setItem("familyId", data.familyId);
        }
        catch (error) {
            console.log("An error occured : ");
            console.log(error);
            //show that an internal error occured
        }
    }
    
    
    useEffect(() => {
        fetchUsernameAndFamily();
    }, []);


    
    
    const styles = StyleSheet.create({
        mainUserDashboard: {
            flex: 1,
            backgroundColor: "black"
        },
        dashboardHeader: {
            width: "100%",
            height: "10%",
            // border: "1px solid white",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 10,
            paddingBottom: 10
        },
        hamburgerIconContainer: {
            // border: "1px solid white",
            height: "100%",
            width: "15%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        hamburgerIcon: {
            width: 30,
            height: 30
        },
        dashboardGreetingContainer: {
            width: "60%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingRight: 20,
            paddingLeft: 10,
            flexShrink: 1,
            
        },
        dashboardGreeting: {
            color: "white",
            fontFamily: "Courier",
            fontSize: 15,
            fontWeight: 100,
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        brandLogoContainer: {
            border: "1px solid white",
            // display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            height:"100%",
            width: "25%"
        },
        brandLogo: {
            // border:"1px solid white",
            height: "100%",
            width: "20%",
            marginRight: 10,
            scale:1.1
        },
        dashboardContent: {
            height: "90vh",
            // border:"1px solid white"
        },
        transparentFilm: {
            position: "absolute",
            zIndex: 2,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor:"rgba(0,0,0,0.80)"
        },
        modal: {
            backgroundColor: modal.backgroundColor,
            borderRadius: 10,
            width: "90%",
            padding:10
        },
        modalUpperSection: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems:"center"
        },
        modalIconContainer: {
            width: "30%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        modalIcon: {
            height: 60,
            width:60
        },
        modalTextContainer: {
            height: "100%",
            width:modal.showIcon ? "70%" : "90%"
        },
        modalLowerSection: {
            marginTop:20
        },
        singleModalButtonContainer: {
            // border: "1px solid black",
            width: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        drawerBackground: {
            position: "absolute",
            top: 0,
            left:0,
            width: "100%",
            height: "100%",
            zIndex: 3,
            backgroundColor:"rgba(0,0,0,0.5)"
        },
        hamburgerMenu: {
            height: "100%",
            width: "80%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 4,
            backgroundColor: "black",
            borderRightWidth: 1,
            borderRightColor: "white",
            display: "flex",
            justifyContent: "space-around",
            // alignItems:"center"
        },
        hamburgerBackArrowContainer: {
            width: 60,
            height:60,
            // border: "1px solid white",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        hamburgerBackArrow: {
            width: 40,
            height:40
        },
        parentBrandSection: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // marginTop:50,
            // border:"1px solid white"
        },
        poweredByText: {
            color: "white",
            // fontFamily: "Avenir",
            fontWeight: 100,
            marginBottom: 10,
            fontSize:12
        },
        parentBrandLogo: {
            height: 120,
            width: 180,
            scale:0.8
            // border:"1px solid white"
        },
        hamburgerOptionsDisplay: {
            width: "100%",
            // border: "1px solid white",
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        selectedOption: {
            backgroundColor: "gray",
            height: 40,
            borderRadius: 5,
            width: "90%",
            display: "flex",
            justifyContent: "center",
            padding: 10,
            marginTop:10
        },
        option: {
            // backgroundColor: "gray",
            height: 40,
            borderRadius: 5,
            width:"90%",
            display: "flex",
            justifyContent: "center",
            // border: "1px solid white",
            padding: 10,
            marginTop:10
        },
        selectedOptionText: {
            color: "black",
            fontFamily: "Helvetica",
            fontSize: 13,
            fontWeight:700
        },
        optionText: {
            color: "white",
            fontFamily: "Helvetica",
            fontSize:13,
            fontWeight:600
        },
        logoutOption: {
            marginTop: 10,
            display: "flex",
            flexDirection: "row",
            height: 50,
            width: "90%",
            // border: "1px solid white",
            alignItems:"center"
        },
        logoutIcon: {
            height: 30,
            width:30
        },
        logoutText: {
            color: "#ff0000",
            fontFamily: "Helvetica",
            fontSize: 13,
            fontWeight: 700,
            marginLeft:10
        },
        aboutAndContactSection: {
            // border: "1px solid white",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop:10
        },
        contactUsText: {
            fontWeight: 100,
            fontSize: 11,
            color: "gray",
            marginBottom:5
        },
        aboutAndContactLower: {
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems:"center"
        },
        parqHomeInfo: {
            display: "flex",
            alignItems: "flex-end"
        },
        parqSystemsInfo: {
            display: "flex",
            alignItems:"flex-start"
        },
        contactNumber: {
            color: "gray",
            fontSize: 10
        },
        contactEmail: {
            color: "gray",
            fontSize: 10,
            marginTop:5
        },
        aboutLink: {
            color: "blue",
            fontSize: 10,
            marginTop:5
        },
        verticalDivider: {
            border: "1px solid gray",
            width: 0,
            height: "100%",
            marginRight: 5,
            marginLeft:5
        },
        rightsReservedSection: {
            // border: "1px solid white",
            marginTop: 20,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding:10
        },
        rightsReservedText: {
            color: "gray",
            fontSize: 10,
            fontWeight: 100,
            fontFamily:"Helvetica"
        },
        copyRightSymbol: {
            color: "gray",
            marginRight: 10,
            fontSize: 20,
            position: "relative",
            bottom:2
        }
    })
    
    return (
        <View style={styles.mainUserDashboard}>
            
            <View style={styles.dashboardHeader}>
                
                <Pressable style={styles.hamburgerIconContainer} onPress={openDrawer}>
                    <Image source={require("./../assets/hamburger-svgrepo-com.svg")} alt="Hamburger" style={styles.hamburgerIcon} />
                </Pressable>

                <View style={styles.dashboardGreetingContainer}>
                    <Text style={styles.dashboardGreeting} numberOfLines={3}>Hello <br></br>{name}!</Text>
                </View>

                {/* <View style={styles.brandLogoContainer}> */}
                    <Image source={require("./../assets/ParqHome-logo-cropped.jpeg")} alt="Brand" style={styles.brandLogo} />
                {/* </View> */}

            </View>







            <View style={styles.dashboardContent}>

                {dashboardContent === "switches" && <SwitchesAndGroups
                    setDashboardContent={setDashboardContent}
                    setSwitchGroup={setSwitchGroup}
                    setSwitches={setSwitches}
                    displayModal={displayModal}
                    closeModal={closeModal} />}
                

                {dashboardContent === "groupManager" && <SwitchGroupManager
                    setDashboardContent={setDashboardContent}
                    switchGroup={switchGroup}
                    switches={switches}
                    displayModal={displayModal}
                    closeModal={closeModal} />}
                

                {dashboardContent === "members" && <MembersAndRequests
                    displayModal={displayModal}
                    closeModal={closeModal} />}
                

                {dashboardContent === "familySwitcher" && <FamilySwitcher
                    displayModal={displayModal}
                    closeModal={closeModal} />}
                

                {dashboardContent === "editProfile" && <ProfileEditor
                    displayModal={displayModal}
                    closeModal={closeModal}
                    setDashboardContent={setDashboardContent} />}
                
                {dashboardContent === "passwordChanger" && <PasswordChanger
                    displayModal={displayModal}
                    closeModal={closeModal}
                    setDashboardContent={setDashboardContent} />}
            </View>






            {drawerOpen && <>
                <Pressable style={styles.drawerBackground} onPress={closeDrawer}></Pressable>
                
                {/* <View style={styles.hamburgerMenu}>
                    <Text style={{color:"white"}}>This is some sample text</Text>
                </View> */}

                <Animated.View style={[styles.hamburgerMenu, { transform: [{ translateX: drawerX }] }]}>

                    {/* <Text style={{color:"white"}}>This is some sample text</Text> */}

                    <Pressable style={styles.hamburgerBackArrowContainer} onPress={closeDrawer}>
                        <Image source={require("./../assets/back-arrow-svgrepo-com.png")} style={styles.hamburgerBackArrow} />
                    </Pressable>

                    <View style={styles.parentBrandSection}>
                        <Text style={styles.poweredByText}>powered by</Text>
                        <Image source={require("./../assets/ParqSystems-full-blackbg.jpeg")} style={styles.parentBrandLogo} />
                    </View>


                    <View style={styles.hamburgerOptionsDisplay}>


                        <Pressable style={dashboardContent === "switches" ? styles.selectedOption : styles.option}
                            onPress={() => {
                                setDashboardContent("switches");
                                closeDrawer();
                            }}>
                            <Text style={dashboardContent === "switches" ? styles.selectedOptionText : styles.optionText}>Switches and Groups</Text>
                        </Pressable>





                        <Pressable style={dashboardContent === "members" ? styles.selectedOption : styles.option}
                            onPress={() => {
                                setDashboardContent("members");
                                closeDrawer();
                            }}>
                            <Text style={dashboardContent === "members" ? styles.selectedOptionText : styles.optionText}>Family Members and Join Requests</Text>
                        </Pressable>






                        <Pressable style={dashboardContent === "familySwitcher" ? styles.selectedOption : styles.option}
                            onPress={() => {
                                setDashboardContent("familySwitcher");
                                closeDrawer();
                            }}>
                            <Text style={dashboardContent === "familySwitcher" ? styles.selectedOptionText : styles.optionText}>Switch to a different Family</Text>
                        </Pressable>





                        <Pressable style={dashboardContent === "editProfile" ? styles.selectedOption : styles.option}
                            onPress={() => {
                                setDashboardContent("editProfile");
                                closeDrawer();
                            }}>
                            <Text style={dashboardContent === "editProfile" ? styles.selectedOptionText : styles.optionText}>Edit Profile</Text>
                        </Pressable>


                        <Pressable style={styles.logoutOption} onPress={handleLogout}>
                            <Image source={require("./../assets/logout-svgrepo-com.png")} style={styles.logoutIcon} />
                            <Text style={styles.logoutText}>Logout</Text>
                        </Pressable>
                    </View>



                    <View style={styles.aboutAndContactSection}>
                        <Text style={styles.contactUsText}>Contact Us</Text>
                        <View style={styles.aboutAndContactLower}>

                            <View style={styles.parqHomeInfo}>
                                <Text style={styles.contactNumber}>+91 0123456789</Text>
                                <Text style={styles.aboutLink}>About ParqHome</Text>
                                
                                <Text style={styles.contactEmail}>parqhome.support@gmail.com</Text>
                                
                            </View>

                            <View style={styles.verticalDivider}></View>


                            <View style={styles.parqSystemsInfo}>
                                <Text style={styles.contactNumber}>+91 987654321</Text>
                                <Text style={styles.aboutLink}>About ParqSystems</Text>
                                
                                <Text style={styles.contactEmail}>support@parqsystems.com</Text>
                                
                            </View>
                        </View>
                    </View>


                    <View style={styles.rightsReservedSection}>
                        <Text style={styles.copyRightSymbol}>{"\u00A9"}</Text>
                        <Text style={styles.rightsReservedText}>ALL RIGHTS RESERVED</Text>
                    </View>

                </Animated.View>
            </>}

            {modal.showModal && <View style={styles.transparentFilm}>
                <View style={styles.modal}>
                    <View style={styles.modalUpperSection}>

                        {modal.showIcon && <View style={styles.modalIconContainer}>
                            <Image source={modal.iconPath} alt="modalIcon" style={styles.modalIcon} />
                        </View>}

                        <View style={styles.modalTextContainer}>
                            <Text style={{
                                color: modal.titleColor,
                                fontSize: 20,
                                fontFamily: "Helvetica",
                                fontWeight: 900,
                                marginBottom:5
                            }}>{modal.title}</Text>
                            <Text style={{
                                color: modal.textColor,
                                fontSize: 13,
                                fontFamily: "Helvetica",
                                fontWeight:600
                            }}>{modal.text}</Text>
                        </View>

                    </View>

                    <View style={styles.modalLowerSection}>
                        <FlatList
                            data={modal.buttons}
                            numColumns={2}
                            keyExtractor={(item) => item.buttonText}
                            columnWrapperStyle={{justifyContent:"space-between"}}
                            renderItem={({ item }) => (
                                <View style={styles.singleModalButtonContainer}>
                                    <Pressable
                                        style={{
                                            backgroundColor: item.buttonBackgroundColor,
                                            width: "90%",
                                            borderRadius: 10,
                                            height: 40,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems:"center"
                                        }}
                                        onPress={item.onButtonClick}>
                                        <Text style={{
                                            color: item.buttonTextColor,
                                            fontFamily: "Helvetica",
                                            fontWeight: 900,
                                            fontSize: 13
                                        }}>{item.buttonText}</Text>
                                    </Pressable>
                                </View>
                            )} />
                    </View>
                </View>
            </View>}

        </View>
    )
}