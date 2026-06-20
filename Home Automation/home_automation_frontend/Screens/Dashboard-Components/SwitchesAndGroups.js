import React from "react";
import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    Image,
    Pressable,
    StyleSheet,
    Switch
} from "react-native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import LottieView from "lottie-react-native";


export default function SwitchesAndGroups(props) {
    
    
    const [showGroups, setShowGroups] = useState(true);

    const [switches, setSwitches] = useState([]);


    const [switchGroups, setSwitchGroups] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [errorOccured, setErrorOccured] = useState(false);

    const familyIdRef = useRef("");



    const getSwitchData = async () => {
        try {
            const familyId = await AsyncStorage.getItem("familyId");
            familyIdRef.current = familyId;
            const response = await fetch("http://localhost:5000/api/dashboard/getSwitchesAndGroups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ familyId })
            });

            if (!response.ok) {
                //display that an error occured while loading switches and groups
                setErrorOccured(true);
                setIsLoading(false);
                return;
            }

            const data = await response.json();

            setIsLoading(false);


            // console.log(data.switchesDoc.switches);
            // console.log(data.switchGroupsDoc.switchGroups);

            setSwitches(data.switchesDoc.switches);
            props.setSwitches(data.switchesDoc.switches);
            setSwitchGroups(data.switchGroupsDoc.switchGroups);
        }
        catch (error) {
            console.log("An error occured : " + error);
            //display that an internal server error occured while loading switches and groups
        }
    }


    const updateSwitch = async (updatesArray) => {
        try {
            const response = await fetch("http://localhost:5000/api/dashboard/updateSwitches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ familyId: familyIdRef.current, switchUpdates: updatesArray })
            });

            if (!response.ok) {
                //display that switch could not be updated
            }
        }
        catch (error) {
            console.log("An error occured while updating switch : ");
            console.log(error);
            //display switch update error
        }
    }


    



    const reduceFanSpeed = (index) => {
        if (switches[index].fanSpeed === 0) {
            return;
        }
        const tempSwitches = [...switches];
        tempSwitches[index].fanSpeed -= 1;
        setSwitches(tempSwitches);
        updateSwitch([{
            switchId: tempSwitches[index].switchId,
            fanSpeed: tempSwitches[index].fanSpeed,
            status: tempSwitches[index].status
        }]);
    }

    const increaseFanSpeed = (index) => {
        if (switches[index].fanSpeed === 5) {
            return;
        }
        const tempSwitches = [...switches];
        tempSwitches[index].fanSpeed += 1;
        setSwitches(tempSwitches);
        updateSwitch([{
            switchId: tempSwitches[index].switchId,
            fanSpeed: tempSwitches[index].fanSpeed,
            status: tempSwitches[index].status
        }]);
    }


    const updateDimmerValue = (index, value) => {
        const tempSwitches = [...switches];
        tempSwitches[index].dimmerValue = value;
        if (value >= 25) {
            tempSwitches[index].status = true;
        }
        else {
            tempSwitches[index].status = false;
        }
        setSwitches(tempSwitches);
    }

    const registerDimmerValue = (index, value) => {
        const switchId = switches[index].switchId;
        updateSwitch([{
            switchId,
            dimmerValue: value,
            status: value > 25 ? true : false
        }]);
    }

    const updateSwitchStatus = (index) => {
        const tempSwitches = [...switches];
        tempSwitches[index].status = !tempSwitches[index].status;
        setSwitches(tempSwitches);
        if (tempSwitches[index].type === "fan") {
            updateSwitch([{
                switchId: tempSwitches[index].switchId,
                status: tempSwitches[index].status,
                fanSpeed: tempSwitches[index].fanSpeed
            }]);
        }
        else {
            updateSwitch([{
                switchId: tempSwitches[index].switchId,
                status: tempSwitches[index].status
            }]);
        }
    }


    const turnGroupOff = (index) => {
        const switchIds = switchGroups[index].switches;
        let tempSwitches = [...switches];
        let switchesToUpdate = [];
        for (let i = 0; i < tempSwitches.length; i++) {
            let currentSwitch = tempSwitches[i];
            if (switchIds.includes(currentSwitch.switchId)) {
                currentSwitch.status = false;
                let updatedSwitch = {
                    switchId: currentSwitch.switchId,
                    status: currentSwitch.status
                };

                if (currentSwitch.type === "dimmer") {
                    currentSwitch.dimmerValue = 0;
                    currentSwitch.status = false;
                    updatedSwitch = {
                        switchId: currentSwitch.switchId,
                        status: currentSwitch.status,
                        dimmerValue: currentSwitch.dimmerValue
                    }
                }

                if (currentSwitch.type === "fan") {
                    updatedSwitch = {
                        switchId: currentSwitch.switchId,
                        status: currentSwitch.status,
                        fanSpeed: currentSwitch.fanSpeed
                    };
                }
                

                switchesToUpdate.push(updatedSwitch);

            }
        }
        setSwitches(tempSwitches);
        updateSwitch(switchesToUpdate);
    }

    const turnGroupOn = (index) => {
        const switchIds = switchGroups[index].switches;
        let tempSwitches = [...switches];
        let switchesToUpdate = [];
        for (let i = 0; i < tempSwitches.length; i++) {
            let currentSwitch = tempSwitches[i];
            if (switchIds.includes(currentSwitch.switchId)) {
                currentSwitch.status = true;
                let updatedSwitch = {
                    switchId: currentSwitch.switchId,
                    status: currentSwitch.status
                };
                if (currentSwitch.type === "dimmer") {
                    currentSwitch.dimmerValue = 50;
                    currentSwitch.status = true;
                    updatedSwitch = {
                        switchId: currentSwitch.switchId,
                        status: currentSwitch.status,
                        dimmerValue: currentSwitch.dimmerValue
                    }
                }

                if (currentSwitch.type === "fan") {
                    updatedSwitch = {
                        switchId: currentSwitch.switchId,
                        status: currentSwitch.status,
                        fanSpeed: currentSwitch.fanSpeed
                    };
                }
                switchesToUpdate.push(updatedSwitch);
            }
        }
        setSwitches(tempSwitches);
        updateSwitch(switchesToUpdate);
    }



    const deleteSwitchGroup = async (groupId) => {
        // console.log("A switch group delete request was generated");
        // console.log(AsyncStorage.getAllKeys());

        try {
            const familyId = await AsyncStorage.getItem("familyId");
            const response = await fetch("http://localhost:5000/api/dashboard/deleteSwitchGroup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ familyId, groupId })
            });

            if (!response.ok) {
                props.displayModal({
                    backgroundColor: "rgb(200,0,0)",
                    displayDuration: 2,
                    text: "Could not delete switch group. Please try again.",
                    textColor: "white"
                });
            }

            props.displayModal({
                backgroundColor: "rgb(0,200,0)",
                displayDuration: 2,
                text: "Switch group deleted successfully",
                textColor: "white"
            });
            getSwitchData();
        }
        catch (error) {
            console.log("An error occured : ");
            console.log(error);
            props.displayModal({ backgroundColor: "rgb(200,0,0)", displayDuration: 2, text: "An internal server error occured while deleting this switch group. Please try again", textColor: "white" });
        }

        
    }



    useEffect(() => {
        const socket = io("http://localhost:5000");

        socket.on("connect", () => {
            console.log("Frontend connected to socket with ID : " + socket.id);
        });

        socket.on("switchUpdate", (data) => {
            console.log("Realtime data from hardware end : ");
            console.log(data);

            setSwitches((prev) => prev.map(sw => sw.switchId === data.switchId ? { ...sw, ...data } : sw));
        });

        return () => {
            socket.disconnect();
        }
    }, []);

    useEffect(() => {
        // getSwitchData();
        setTimeout(() => {
            getSwitchData();
        }, 4000);
    }, []);
    
    const styles = StyleSheet.create({
        switchesAndGroupsContainer: {
            flex: 1,
            // border: "1px solid white"
        },
        switchViewsToggleContainer: {
            // border: "1px solid white",
            width: "100%",
            height: "15%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        switchViewsToggle: {
            // border: "1px solid white",
            borderRadius: 10,
            width: "100%",
            height: 60,
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center"
        },
        groupsOption: {
            // border: "1px solid white",
            width: "40%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 20,
            // transition: "background-color 0.3s",
            borderRadius: 10
        },
        groupsOptionText: {
            color: "white",
            fontFamily: "Helvetica",
            fontWeight: "bold",
            fontSize: 15
        },
        selectedGroupsOption: {
            border: "1px solid yellow",
            width: "40%",
            height: "80%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // backgroundColor: "rgb(168,253,181)",
            marginRight: 20,
            borderRadius: 10,
            // transition:"background-color 0.3s"
            shadowColor: "yellow",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 10
        },
        selectedGroupsOptionText: {
            color: "yellow",
            fontFamily: "Helvetica",
            fontWeight: "bold",
            fontSize: 15
        },
        switchesOption: {
            // border: "1px solid white",
            width: "40%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        switchesOptionText: {
            color: "white",
            fontFamily: "Helvetica",
            fontWeight: "bold",
            fontSize: 15
        },
        selectedSwitchesOption: {
            border: "1px solid yellow",
            width: "40%",
            height: "80%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // backgroundColor: "rgb(168, 253, 181)",
            borderRadius: 10,
            shadowColor: "yellow",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 10
        },
        selectedSwitchesOptionText: {
            color: "yellow",
            fontFamily: "Helvetica",
            fontWeight: "bold",
            fontSize: 15
        },
        switchesDisplay: {
            // border: "1px solid white",
            height: "85%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            overflowY: "scroll",
            paddingTop: 0
        },
        singleSwitch: {
            backgroundColor: "gray",
            height: 50,
            width: "90%",
            marginTop: 10,
            marginBottom: 10,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            padding: 10
        },
        singleSwitchName: {
            fontFamily: "Helvetica",
            fontWeight: 600,
            fontSize: 12,
            flex: 4,
            // color:"white"
        },
        middleSection: {
            // border:"1px solid black",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            flex: 5,
            height: "100%"
        },
        fanSpeedSection: {
            // border:"1px solid black",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
        },
        backTriangle: {
            height: 20,
            width: 10,
            margin: 10,
            scale: 0.8
        },
        disabledBackTriangle: {
            height: 20,
            width: 10,
            margin: 10,
            scale: 0.8,
            opacity: 0.5
        },
        frontTriangle: {
            height: 20,
            width: 10,
            transform: "rotate(180deg)",
            margin: 10,
            scale: 0.8
        },
        disabledFrontTriangle: {
            height: 20,
            width: 10,
            transform: "rotate(180deg)",
            margin: 10,
            scale: 0.8,
            opacity: 0.5
        },
        fanSpeedIncreaser: {
            fontSize: 20,
            margin: 10
        },
        fanSpeedReducer: {
            fontSize: 25,
            margin: 10
        },
        fanSpeedDisplayBox: {
            border: "1px solid black",
            borderRadius: 5,
            width: 40,
            height: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        statusOrValueDisplay: {
            flex: 2,
            // border: "1px solid black",
            height: "100%"
        },
        fanSpeedDisplay: {
            fontFamily: "Helvetica",
            fontSize: 15,
            fontWeight: "bold"
        },
        dimmerValueDisplay: {
            // border: "1px solid black",
            height: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 2
        },
        fanSwitchDisplay: {
            // border:"1px solid black",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            flex: 2
        },
        onOffText: {
            fontFamily: "Helvetica",
            fontWeight: 800,
            fontSize: 10,
            marginRight: 10
        },
        fan: {
            height: 25,
            width: 25
        },
        lightSwitchDisplay: {
            // border:"1px solid black",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            flex: 2
        },
        bulb: {
            height: 30,
            width: 30
        },
        dimmerValueSection: {
            // width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 5
        },
        sliderContainer: {
            width: "90%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 30
        },
        gradient: {
            position: "absolute",
            width: "100%",
            height: 8,
            borderRadius: 10
        },
        slider: {
            width: "100%",
            height: 20
        },
        switchGroupsDisplay: {
            // width: "100%",
            height: "75%",
            // border: "1px solid white",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            overflowY: "scroll",
            paddingTop: 5,
            // paddingBottom:5
            // position:"relative"
        },
        singleSwitchGroup: {
            // border:"1px solid white",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 80
        },
        singleSwitchGroupTopBar: {
            borderBottomWidth: "3px",
            borderBottomColor: "white",
            borderBottomStyle: "solid",
            paddingBottom: 10,
            height: 60,
            width: "90%",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between"
        },
        singleSwitchGroupName: {
            fontFamily: "Avenir",
            fontSize: 20,
            color: "white"
        },
        orangeGroupStatusToggle: {
            width: 150,
            height: 40,
            border: "2px solid orange",
            borderRadius: 10,
            display: "flex",
            flexDirection: "row",
            overflow: "hidden"
        },
        redGroupStatusToggle: {
            width: 150,
            height: 40,
            border: "2px solid rgb(150,0,0)",
            borderRadius: 10,
            display: "flex",
            flexDirection: "row",
            overflow: "hidden"
        },
        greenGroupStatusToggle: {
            width: 150,
            height: 40,
            border: "2px solid rgb(0,150,0)",
            borderRadius: 10,
            display: "flex",
            flexDirection: "row",
            overflow: "hidden"
        },
        groupOn: {
            width: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        selectedGroupOn: {
            width: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgb(0,150,0)"
        },
        groupOff: {
            width: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        selectedGroupOff: {
            width: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgb(150,0,0)"
        },
        groupOnText: {
            fontFamily: "Helvetica",
            fontWeight: "bold",
            color: "white"
        },
        selectedGroupOnText: {
            fontFamily: "Helvetica",
            fontWeight: "bold",
            color: "white"
        },
        groupOffText: {
            fontFamily: "Helvetica",
            fontWeight: "bold",
            color: "white"
        },
        selectedGroupOffText: {
            fontFamily: "Helvetica",
            fontWeight: "bold",
            color: "white"
        },
        redVerticalToggleDivider: {
            width: 0,
            height: "100%",
            border: "1px solid rgb(150,0,0)"
        },
        greenVerticalToggleDivider: {
            width: 0,
            height: "100%",
            border: "1px solid rgb(0,150,0)"
        },
        orangeVerticalToggleDivider: {
            width: 0,
            height: "100%",
            border: "1px solid orange"
        },
        groupSwitchesDisplay: {
            // border: "1px solid white",
            width: "100%",
            justifyContent: "center",
            alignItems: "center"
        },
        dimmerValue: {
            fontWeight: "bold"
        },
        editAndDeleteContainer: {
            width: "90%",
            // border: "1px solid white",
            display: "flex",
            // justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            marginTop: 10
        },
        editText: {
            color: "rgb(255, 200, 0)",
            // fontFamily: "Helvetica",
            fontSize: 13,
            fontWeight: 100,
            marginTop: 2
        },
        deleteText: {
            color: "rgb(255,0,0)",
            // fontFamily: "Helvetica",
            fontSize: 13,
            fontWeight: 400,
            marginLeft: 5
        },
        editContainer: {
            // border: "1px solid white",
            width: "15%",
            height: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        deleteContainer: {
            // border: "1px solid white",
            width: "15%",
            height: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        editIcon: {
            height: 33,
            width: 33,
            // border:"1px solid white"
        },
        deleteIcon: {
            height: 35,
            width: 35,
            // border:"1px solid white"
        },
        addSwitchGroupSection: {
            // border: "1px solid white",
            width: "100%",
            height: "10%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            opacity: 0.5,
            paddingBottom: 10,
            paddingTop: 10,
            // position: "absolute",
            // top:0,
            // bottom:0,
            backgroundColor: "black"
        },
        addSwitchGroupIcon: {
            height: 40,
            width: 40,
            marginRight: 10
        },
        addSwitchGroupText: {
            color: "white"
        },
        loadingContainer: {
            flex: 1,
            // border: "1px solid white",
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
        errorOccuredContainer: {
            flex: 1,
            // border: "1px solid white",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        errorIcon: {
            height: 50,
            width:50
        },
        errorOccuredText: {
            color: "#999999",
            fontFamily: "Helvetica",
            fontSize: 13,
            fontStyle: "italic",
            marginTop:20
        },
        retryLink: {
            fontFamily: "Helvetica",
            fontSize: 15,
            color: "blue",
            marginTop: 50,
            fontWeight:700
        },
        noGroupsDisplay: {
            // border: "1px solid white",
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity:0.5
        },
        noGroupsText: {
            color: "white",
            fontSize: "15",
            fontFamily: "Helvetica",
            marginTop:30
        },
        largerAddSwitchGroupIcon: {
            height: 60,
            width:60
        }
    });
    
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingAnimationContainer}>
                <LottieView
                    source={require("./../../Animations/ThunderBolt.json")}
                    autoPlay
                    loop
                    style={styles.loadingAnimation}
                renderMode="SVG"/>
                </View>
                <Text style={styles.loadingText}>Loading your switches and groups...</Text>
            </View>
        )
    }
    else if (errorOccured) {
        return (
            <View style={styles.errorOccuredContainer}>
                <Image source={require("./../../assets/error-16-svgrepo-com.png")} style={styles.errorIcon} />
                <Text style={styles.errorOccuredText}>An error occured while loading switch data</Text>
                <Pressable style={styles.retryLinkContainer} onPress={getSwitchData}>
                    <Text style={styles.retryLink}>Tap here to try again</Text>
                </Pressable>
            </View>
        )
    }
    
    else {
        return (
            < View style={styles.switchesAndGroupsContainer} >

                <View style={styles.switchViewsToggleContainer}>
                    <View style={styles.switchViewsToggle}>
                        <Pressable style={showGroups ? styles.selectedGroupsOption : styles.groupsOption} onPress={() => setShowGroups(true)}>
                            <Text style={showGroups ? styles.selectedGroupsOptionText : styles.groupsOptionText}>My Switch Groups</Text>
                        </Pressable>
                        <Pressable style={showGroups ? styles.switchesOption : styles.selectedSwitchesOption} onPress={() => setShowGroups(false)}>
                            <Text style={showGroups ? styles.switchesOptionText : styles.selectedSwitchesOptionText}>All Switches</Text>
                        </Pressable>
                    </View>

                
                </View>


                {
                    showGroups && switchGroups.length > 0 && <Pressable style={styles.addSwitchGroupSection} onPress={() => {
                        props.setSwitchGroup(null);
                        props.setDashboardContent("groupManager");
                    }}>
                        <Image source={require("./../../assets/add-square-svgrepo-com.png")} style={styles.addSwitchGroupIcon} />
                        <Text style={styles.addSwitchGroupText}>Add a new Switch Group</Text>
                    </Pressable>
                }

                {
                    showGroups ?
                        <View style={styles.switchGroupsDisplay}>



                    

                    

                            {switchGroups.length > 0 ? switchGroups.map((singleSwitchGroup, index) => {
                        
                                let groupIsOff = true;
                                let groupIsOn = true;
                        
                                for (let i = 0; i < singleSwitchGroup.switches.length; i++) {
                                    let tempSwitch = switches.find((sw) => sw.switchId === singleSwitchGroup.switches[i]);
                                    if (!tempSwitch) {
                                        return;
                                    }
                                    if (tempSwitch.type === "dimmer" && tempSwitch.dimmerValue < 25) {
                                        groupIsOn = false;
                                    }
                                    if (tempSwitch.status) {
                                        groupIsOff = false;
                                    }
                                    else {
                                        groupIsOn = false;
                                    }
                                }
                        
                        
                                return (
                                    <View style={styles.singleSwitchGroup} key={index}>
                                
                                        <View style={styles.singleSwitchGroupTopBar}>
                                    
                                            <Text style={styles.singleSwitchGroupName}>{singleSwitchGroup.groupName}</Text>
                                    
                                            <View style={styles.groupStatusToggleContainer}>
                                                <View style={groupIsOn ? styles.greenGroupStatusToggle : groupIsOff ? styles.redGroupStatusToggle : styles.orangeGroupStatusToggle}>
                                            
                                                    <Pressable style={groupIsOn ? styles.selectedGroupOn : styles.groupOn} onPress={() => turnGroupOn(index)}>
                                                        <Text style={groupIsOn ? styles.selectedGroupOnText : styles.groupOnText}>ON</Text>
                                                    </Pressable>

                                                    <View style={groupIsOn ? styles.greenVerticalToggleDivider : groupIsOff ? styles.redVerticalToggleDivider : styles.orangeVerticalToggleDivider}></View>
                                            
                                                    <Pressable style={groupIsOff ? styles.selectedGroupOff : styles.groupOff} onPress={() => turnGroupOff(index)}>
                                                        <Text style={groupIsOff ? styles.selectedGroupOffText : styles.groupOffText}>OFF</Text>
                                                    </Pressable>
                                                </View>
                                            </View>


                                        </View>


                                        <View style={styles.editAndDeleteContainer}>

                                            <Pressable style={styles.editContainer} onPress={() => {
                                                props.setSwitchGroup(singleSwitchGroup);
                                                props.setDashboardContent("groupManager");
                                            }}>
                                                <Image source={require("./../../assets/edit-3-svgrepo-com.png")} style={styles.editIcon} />
                                                {/* <Text style={styles.editText}>Edit</Text> */}
                                            </Pressable>

                                            <Pressable style={styles.deleteContainer} onPress={() => { 
                                                props.displayModal({
                                                    title: "Delete Switch Group ?",
                                                    text: "Once you delete this switch group, you will not be able to see or control it again. This group will have to be created again. Tap \"delete\" below to continue",
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
                                                                deleteSwitchGroup(singleSwitchGroup.groupId);
                                                                props.closeModal();
                                                            }
                                                        }]
                                                })
                                            }}>
                                                <Image source={require("./../../assets/delete-2-svgrepo-com.png")} style={styles.deleteIcon} />
                                                {/* <Text style={styles.deleteText}>Delete</Text> */}
                                            </Pressable>
                                        </View>

                                        <View style={styles.groupSwitchesDisplay}>
                                            {singleSwitchGroup.switches.map((singleGroupSwitchId, index) => {
                                        
                                                let singleSwitch = switches.find((sw) => sw.switchId === singleGroupSwitchId);
                                                let singleSwitchIndex = switches.findIndex((sw) => sw.switchId === singleGroupSwitchId);
                                        
                                                return (
                                                    <View style={styles.singleSwitch} key={index}>
                            
                                                        <Text style={styles.singleSwitchName}>{singleSwitch.switchName}</Text>
                            
                                                        <View style={styles.middleSection}>
                                
                                
                                                            {singleSwitch.type === "fan" && <View style={styles.fanSpeedSection}>
                                    
                                                                {/* <Text style={styles.fanSpeedReducer}>-</Text> */}
                                        
                                                                <Pressable style={styles.backTriangleContainer} onPress={() => reduceFanSpeed(singleSwitchIndex)}>
                                                                    <Image source={require("./../../assets/black-back-arrow.svg")} style={singleSwitch.fanSpeed === 0 ? styles.disabledBackTriangle : styles.backTriangle} />
                                                                </Pressable>
                                        
                                                                <View style={styles.fanSpeedDisplayBox}>
                                                                    <Text style={styles.fanSpeedDisplay}>{singleSwitch.fanSpeed}</Text>
                                                                </View>

                                                                {/* <Text style={styles.fanSpeedIncreaser}>+</Text> */}

                                                                <Pressable style={styles.frontTriangleContainer} onPress={() => increaseFanSpeed(singleSwitchIndex)}>
                                                                    <Image source={require("./../../assets/black-back-arrow.svg")} style={singleSwitch.fanSpeed === 5 ? styles.disabledFrontTriangle : styles.frontTriangle} />
                                                                </Pressable>
                                                            </View>}





                                
                                                            {singleSwitch.type === "dimmer" && <View style={styles.dimmerValueSection}>
                                    
                                    
                                                                <View style={styles.sliderContainer}>

                                                                    {/* <LinearGradient
                                                            colors={["#222", "#FFD700"]}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                            style={styles.gradient} /> */}
                                            
                                                                    <Slider
                                                                        minimumValue={0}
                                                                        maximumValue={100}
                                                                        step={1}
                                                                        value={singleSwitch.dimmerValue}
                                                                        onValueChange={(value) => {
                                                                            updateDimmerValue(singleSwitchIndex, value);
                                                                        }}
                                                                        onSlidingComplete={(value) => {
                                                                            registerDimmerValue(singleSwitchIndex, value);
                                                                        }}
                                                                        minimumTrackTintColor={singleSwitch.dimmerValue > 25 ? "#FFD700" : "#1e1e1e"}
                                                                        maximumTrackTintColor="#1e1e1e"
                                                                        thumbTintColor={singleSwitch.dimmerValue > 25 ? "#FFD700" : "#1e1e1e"}
                                                                        style={styles.slider} />

                                                                </View>
                                    


                                                            </View>}






                                                        </View>


                                                        <View style={styles.statusOrValueDisplay}>
                                                            {singleSwitch.type === "dimmer" &&
                                                                <View style={styles.dimmerValueDisplay}>
                                                                    <Text style={styles.dimmerValue}>{singleSwitch.dimmerValue}</Text>
                                                                </View>
                                                            }
                                    
                                                            {singleSwitch.type === "fan" &&
                                                                <Pressable style={styles.fanSwitchDisplay} onPress={() => updateSwitchStatus(singleSwitchIndex)}>
                                                                    <Text style={styles.onOffText}>{singleSwitch.status ? "ON" : "OFF"}</Text>
                                                                    <Image
                                                                        source={singleSwitch.status ?
                                                                            require("./../../assets/blue-fan-svgrepo-com.png")
                                                                            :
                                                                            require("./../../assets/fan-svgrepo-com.png")}
                                                                        style={styles.fan} />
                                                                </Pressable>
                                                            }
                                
                                                            {singleSwitch.type === "light" &&
                                                                <Pressable style={styles.lightSwitchDisplay} onPress={() => updateSwitchStatus(singleSwitchIndex)}>
                                                                    <Text style={styles.onOffText}>{singleSwitch.status ? "ON" : "OFF"}</Text>
                                                                    <Image
                                                                        source={singleSwitch.status ?
                                                                            require("./../../assets/yellow-bulb.svg")
                                                                            :
                                                                            require("./../../assets/black-bulb.svg")
                                                                        }
                                                                        style={styles.bulb} />
                                                                </Pressable>
                                                            }
                                                        </View>


                                                    </View>
                                                )
                                            })}
                                        </View>



                                    </View>
                                )
                            })
                                :
                                <View style={styles.noGroupsDisplay}>
                                    <Pressable style={styles.addFirstSwitchGroupPressable} onPress={() => {
                                        props.setSwitchGroup(null);
                                        props.setDashboardContent("groupManager");
                                    }}>
                                        <Image source={require("./../../assets/add-square-svgrepo-com.png")} style={styles.largerAddSwitchGroupIcon} />
                                    </Pressable>
                                    <Text style={styles.noGroupsText}>You have no switch groups yet! Tap above to get started</Text>
                                </View>}
                        </View>
                        :
                        <View style={styles.switchesDisplay}>
                            {switches?.map((singleSwitch, index) => {
                                return (
                                    <View style={styles.singleSwitch} key={index}>
                            
                                        <Text style={styles.singleSwitchName}>{singleSwitch.switchName}</Text>
                            
                                        <View style={styles.middleSection}>
                                
                                
                                            {singleSwitch.type === "fan" && <View style={styles.fanSpeedSection}>
                                    
                                                {/* <Text style={styles.fanSpeedReducer}>-</Text> */}
                                    
                                                <Pressable style={styles.backTriangleContainer} onPress={() => reduceFanSpeed(index)}>
                                                    <Image source={require("./../../assets/black-back-arrow.svg")} style={singleSwitch.fanSpeed === 0 ? styles.disabledBackTriangle : styles.backTriangle} />
                                                </Pressable>
                                    
                                                <View style={styles.fanSpeedDisplayBox}>
                                                    <Text style={styles.fanSpeedDisplay}>{singleSwitch.fanSpeed}</Text>
                                                </View>

                                                {/* <Text style={styles.fanSpeedIncreaser}>+</Text> */}

                                                <Pressable style={styles.frontTriangleContainer} onPress={() => increaseFanSpeed(index)}>
                                                    <Image source={require("./../../assets/black-back-arrow.svg")} style={singleSwitch.fanSpeed === 5 ? styles.disabledFrontTriangle : styles.frontTriangle} />
                                                </Pressable>
                                            </View>}





                                
                                            {singleSwitch.type === "dimmer" && <View style={styles.dimmerValueSection}>
                                    
                                    
                                                <View style={styles.sliderContainer}>

                                                    {/* <LinearGradient
                                            colors={["#222", "#FFD700"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.gradient} /> */}
                                        
                                                    <Slider
                                                        minimumValue={0}
                                                        maximumValue={100}
                                                        step={1}
                                                        value={singleSwitch.dimmerValue}
                                                        onValueChange={(value) => {
                                                            updateDimmerValue(index, value);
                                                        }}
                                                        onSlidingComplete={(value) => {
                                                            registerDimmerValue(index, value);
                                                        }}
                                                        minimumTrackTintColor={singleSwitch.dimmerValue > 25 ? "#FFD700" : "#1e1e1e"}
                                                        maximumTrackTintColor="#1e1e1e"
                                                        thumbTintColor={singleSwitch.dimmerValue > 25 ? "#FFD700" : "#1e1e1e"}
                                                        style={styles.slider} />

                                                </View>
                                    


                                            </View>}






                                        </View>


                                        <View style={styles.statusOrValueDisplay}>
                                            {singleSwitch.type === "dimmer" &&
                                                <View style={styles.dimmerValueDisplay}>
                                                    <Text style={styles.dimmerValue}>{singleSwitch.dimmerValue}</Text>
                                                </View>}
                                    
                                            {singleSwitch.type === "fan" &&
                                                <Pressable style={styles.fanSwitchDisplay} onPress={() => updateSwitchStatus(index)}>
                                                    <Text style={styles.onOffText}>{singleSwitch.status ? "ON" : "OFF"}</Text>
                                                    <Image
                                                        source={singleSwitch.status ?
                                                            require("./../../assets/blue-fan-svgrepo-com.png")
                                                            :
                                                            require("./../../assets/fan-svgrepo-com.png")}
                                                        style={styles.fan} />
                                                </Pressable>}
                                
                                            {singleSwitch.type === "light" &&
                                                <Pressable style={styles.lightSwitchDisplay} onPress={() => updateSwitchStatus(index)}>
                                                    <Text style={styles.onOffText}>{singleSwitch.status ? "ON" : "OFF"}</Text>
                                                    <Image
                                                        source={singleSwitch.status ?
                                                            require("./../../assets/yellow-bulb.svg")
                                                            :
                                                            require("./../../assets/black-bulb.svg")
                                                        }
                                                        style={styles.bulb} />
                                                </Pressable>}
                                        </View>


                                    </View>

                                )
                            })}
                        </View>
                }


            </View >
        )
    }
}