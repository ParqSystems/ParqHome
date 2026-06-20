import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Image,
    ScrollView
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SwitchGroupManager(props) {


    const scrollRef = useRef(null);


    const [switchGroupName, setSwitchGroupName] = useState("");

    const [selectedSwitches, setSelectedSwitches] = useState([]);
    const [availableSwitches, setAvailableSwitches] = useState([]);

    const [errors, setErrors] = useState({
        groupNameError: false,
        addedSwitchesError: false
    });

    useEffect(() => {
        setSwitchGroupName(props?.switchGroup?.groupName ?? "");
        if (props.switchGroup && props.switches) {
            const tempSelectedSwitches = props.switches.filter((sw) => props.switchGroup.switches.includes(sw.switchId));
            const tempAvailableSwitches = props.switches.filter((sw) => !props.switchGroup.switches.includes(sw.switchId));
            setSelectedSwitches(tempSelectedSwitches);
            setAvailableSwitches(tempAvailableSwitches);
            console.log(props.switchGroup);
        }
        else if (props.switches) {
            setSelectedSwitches([]);
            setAvailableSwitches(props.switches);
        }
    }, [props.switchGroup, props.switches]);



    const handleAdd = (index) => {
        setErrors((prev) => ({ ...prev, addedSwitchesError: false }));
        const tempAvailable = [...availableSwitches];
        const tempSelected = [...selectedSwitches];
        tempSelected.push(tempAvailable[index]);
        tempAvailable.splice(index, 1);

        setAvailableSwitches(tempAvailable);
        setSelectedSwitches(tempSelected);
    }


    const handleDelete = (index) => {
        const tempAvailable = [...availableSwitches];
        const tempSelected = [...selectedSwitches];
        tempAvailable.push(tempSelected[index]);
        tempSelected.splice(index, 1);

        setAvailableSwitches(tempAvailable);
        setSelectedSwitches(tempSelected);
    }


    const handleSubmit = async () => {

        let hasError = false;
        if (!switchGroupName.trim()) {
            setErrors((prev) => ({ ...prev, groupNameError: true }));
            hasError = true;
        }
        if (selectedSwitches.length === 0) {
            setErrors((prev) => ({ ...prev, addedSwitchesError: true }));
            hasError = true;
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        }
        if (hasError) {
            return;
        }

        try {
            
            const selectedSwitchIds = selectedSwitches.map((sw) => sw.switchId);

            const familyId = await AsyncStorage.getItem("familyId");
            
            const response = await fetch("http://localhost:5000/api/dashboard/addOrUpdateSwitchGroup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    familyId,
                    switchGroup: {
                        groupId:props.switchGroup ? props.switchGroup.groupId : Math.floor(100 + Math.random() * 900),
                        groupName: switchGroupName,
                        switches: selectedSwitchIds
                    }
                })
            });

            if (!response.ok) {
                //show that an error occured
                props.displayModal({ backgroundColor: "rgb(182, 0, 0)", text: "An error occured while creating/updating switch group. Please try again", textColor:"white", displayDuration: 2 });
                return;
            }

            //show that switch group addition/update was successful
            props.displayModal({ backgroundColor: "rgb(0, 125, 0)", text: "Switch group updated/created successfully", textColor:"white", displayDuration: 2 });
            props.setDashboardContent("switches");


        }


        catch (error) {
            console.log(error);
            //show that an error occured
            props.displayModal({ backgroundColor: "rgb(255, 0, 0)", text: "An internal error occured. Please try again", textColor:"white", displayDuration: 2 });
        }



    }
    
    
    const styles = StyleSheet.create({
        switchGroupManager: {
            height: "90vh",
            width: "100%",
            // border: "1px solid white",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center"
        },
        sampleText: {
            color:"white"
        },
        groupNameSection: {
            width: "100%",
            height: "20%",
            // border: "1px solid white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // borderBottomWidth: 2,
            borderBottomColor: "yellow"
        },
        groupNameInputLabel: {
            color: "white",
            // border: "1px solid white",
            width: "70%",
            fontFamily: "Helvetica",
            fontSize: 15,
            marginBottom:5
        },
        groupNameInput:{
            width: "70%",
            height: 40,
            // border: "1px solid white",,
            borderRadius:10,
            backgroundColor: "white",
            padding:10
        },
        redGroupNameInput: {
            width: "70%",
            height: 40,
            border: "4px solid red",
            borderRadius:10,
            backgroundColor: "white",
            padding: 10,
            // borderColor:"red"
        },
        groupNameErrorText: {
            color: "red",
            fontSize: "13",
            fontFamily: "Helvetica",
            fontWeight: 500,
            marginTop: 5,
            // border:"1px solid white"
        },
        switchListsContent: {
            // width: "100%",
            // height:"60%",
            // marginTop: 50,
            // border: "1px solid white",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            overflowY: "scroll",
            paddingTop: 20,
            paddingBottom:20
        },
        switchListsContainer: {
            width: "100%",
            height:"60%"
        },
        addedSwitchesText: {
            fontFamily: "Avenir",
            fontSize: 20,
            color: "white",
            // border: "1px solid white",
            width:"90%"
        },
        redAddedSwitchesText: {
            fontFamily: "Avenir",
            fontSize: 20,
            color: "red",
            // border: "1px solid white",
            width:"90%"
        },
        horizontalBar: {
            border: "1px solid white",
            width: "90%",
            height: 0,
            marginTop:5
        },
        redHorizontalBar: {
            border: "1px solid red",
            width: "90%",
            height: 0,
            marginTop:5
        },
        selectedSwitchesContainer: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        singleSelectedSwitch: {
            backgroundColor: "gray",
            // border:"2px solid yellow",
            width: "85%",
            borderRadius: 10,
            height: 50,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            marginTop:15
        },
        singleSelectedSwitchName: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize: 13,
            flex:8
        },
        crossIcon: {
            height: 40,
            width: 40,
            // scale:0.5,
            // flex: 2,
            // border:"1px solid white"
        },
        crossIconContainer: {
            flex: 2,
            // border: "1px solid black",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        availableSwitchesContainer: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop:80
        },
        availableSwitchesText: {
            fontFamily: "Avenir",
            fontSize: 20,
            color: "white",
            // border: "1px solid white",
            width:"90%"
        },
        singleAvailableSwitch: {
            backgroundColor: "gray",
            width: "85%",
            borderRadius: 10,
            height: 50,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            marginTop:15
        },
        singleAvailableSwitchName: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize: 13,
            flex:8
        },
        addIcon: {
            height: 30,
            width: 30,
            // scale:0.4,
            // flex: 2,
            // border:"1px solid white"
        },
        addIconContainer: {
            flex: 2,
            // border: "1px solid black",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        buttonsContainer: {
            width: "100%",
            height: "20%",
            // border: "1px solid white",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems:"center"
        },
        returnButton: {
            backgroundColor: "rgb(200,0,0)",
            height: 50,
            width: "35%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center",
            borderRadius: 10,
            marginRight:20
        },
        returnButtonText: {
            color: "white",
            fontSize: 14,
            fontFamily: "Helvetica",
            fontWeight: 700
        },
        updateOrAddButton: {
            backgroundColor: "green",
            height: 50,
            width: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius:10
        },
        updateOrAddButtonText: {
            color: "white",
            fontSize: 14,
            fontFamily: "Helvetica",
            fontWeight: 700
        },
        noSwitchesSelectedDisplay: {
            // border: "1px solid white",
            width: "90%",
            height: 80,
            display: "flex",
            justifyContent: "flex-end",
            alignItems:"center"
        },
        addSwitchesText: {
            fontFamily: "Helvetica",
            color: "gray",
            fontSize: 15,
            fontStyle:"italic"
        },
        redAddSwitchesText: {
            fontFamily: "Helvetica",
            color: "red",
            fontSize: 15,
            fontStyle:"italic"
        }
    })
    
    
    
    return (
        <View style={styles.switchGroupManager}>
            {/* <Text style={styles.sampleText}>This is the switch-group manager</Text> */}

            <View style={styles.groupNameSection}>
                <Text style={styles.groupNameInputLabel}>Switch Group name</Text>
            <TextInput
                style={errors.groupNameError ? styles.redGroupNameInput : styles.groupNameInput}
                value={switchGroupName}
                onChangeText={(text) => {
                    setSwitchGroupName(text);
                    setErrors((prev) => ({ ...prev, groupNameError:false}));
                    }} />
                
                {errors.groupNameError && <Text style={styles.groupNameErrorText}>Group name is required</Text>}
                </View>
            
            <ScrollView contentContainerStyle={styles.switchListsContent} style={styles.switchListsContainer} ref={scrollRef}>


                

                <View style={styles.selectedSwitchesContainer}>

                    <Text style={errors.addedSwitchesError ? styles.redAddedSwitchesText : styles.addedSwitchesText}>Added Switches ({selectedSwitches.length})</Text>
                    <View style={errors.addedSwitchesError ? styles.redHorizontalBar : styles.horizontalBar}></View>

                    {selectedSwitches.length > 0 ? selectedSwitches.map((singleSelectedSwitch, index) => {
                        return (
                            <View style={styles.singleSelectedSwitch} key={index}>
                                <Text style={styles.singleSelectedSwitchName}>{singleSelectedSwitch.switchName}</Text>
                                <Pressable style={styles.crossIconContainer} onPress={()=>handleDelete(index)}>
                                    <Image source={require("./../../assets/cross-svgrepo-com.png")} style={styles.crossIcon} />
                                </Pressable>
                            </View>
                        )
                    })
                        :
                        <View style={styles.noSwitchesSelectedDisplay}>
                            {errors.addedSwitchesError ?
                                <Text style={styles.redAddSwitchesText}>A switch group must contain at least one switch</Text>
                                :
                                <Text style={styles.addSwitchesText}>Scroll down to view and add switches</Text>}
                        </View>}
                </View>



                <View style={styles.availableSwitchesContainer}>
                    <Text style={styles.availableSwitchesText}>Available Switches</Text>
                    <View style={styles.horizontalBar}></View>

                    {availableSwitches.map((singleAvailableSwitch, index) => {
                        return (
                            <View style={styles.singleAvailableSwitch} key={index}>
                                <Text style={styles.singleAvailableSwitchName}>{singleAvailableSwitch.switchName}</Text>
                                <Pressable style={styles.addIconContainer} onPress={()=>handleAdd(index)}>
                                    <Image source={require("./../../assets/add-ellipse-svgrepo-com.png")} style={styles.addIcon} />
                                </Pressable>
                            </View>
                        )
                    })}
                </View>
            </ScrollView>


            <View style={styles.buttonsContainer}>
                <Pressable style={styles.returnButton} onPress={()=>props.setDashboardContent("switches")}>
                    <Text style={styles.returnButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.updateOrAddButton} onPress={handleSubmit}>
                    <Text style={styles.updateOrAddButtonText}>{props?.switchGroup ? "Update Switch Group" : "Create Switch Group"}</Text>
                </Pressable>
            </View>

        </View>
    )
}