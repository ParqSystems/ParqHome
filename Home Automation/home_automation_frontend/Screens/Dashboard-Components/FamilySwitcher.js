import React from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    FlatList
} from "react-native";
import { useState } from "react";

export default function FamilySwitcher(props) {

    const [selectedIndex, setSelectedIndex] = useState(0);


    const sampleRoles = [
        {
            family: "Sanadi",
            role: "admin"
        },
        {
            family: "Sharma",
            role: "guest"
        },
        {
            family: "Pandya",
            role: "guest"
        }
    ];
    
    
    const styles = StyleSheet.create({
        familySwitcher: {
            flex: 1,
            // border: "1px solid white",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        sampleText: {
            color:"white"
        },
        rolesFlatlist: {
            width: "100%",
            flexGrow:1,
            // border: "1px solid white",
            justifyContent:"center",
            // alignItems:"center"
        },
        selectedRole: {
            width: "90%",
            padding: 10,
            borderRadius: 5,
            backgroundColor: "rgb(0,120,0)",
            display: "flex",
            flexDirection: "row",
            alignSelf: "center",
            marginTop: 10,
            // transform:"scale(1.05)"
        },
        role: {
            width: "90%",
            padding: 10,
            borderRadius: 5,
            backgroundColor: "gray",
            display: "flex",
            flexDirection: "row",
            alignSelf: "center",
            marginTop:10
        },
        selectedRoleTextSection: {
            width:"70%"
        },
        roleTextSection: {
            width:"70%"
        },
        selectedRoleFamilyText: {
            fontFamily: "Helvetica",
            color: "white",
            fontWeight: 700,
            fontSize:14
        },
        roleFamilyText: {
            fontFamily: "Helvetica",
            color: "black",
            fontWeight: 700,
            fontSize:14
        },
        selectedRoleRoleText: {
            fontFamily: "Helvetica",
            color: "white",
            fontWeight: 700,
            fontSize: 11,
            marginTop:5
        },
        roleRoleText: {
            fontFamily: "Helvetica",
            color: "white",
            fontWeight: 700,
            fontSize: 11,
            marginTop: 5,
            color:"black"
        },
        selectedRoleLeaveSection: {
            width: "30%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        roleLeaveSection: {
            width: "30%",
            display: "flex",
            justifyContent: "center",
            alignItems:"center"
        },
        leaveFamilyButton: {
            backgroundColor: "rgb(180,0,0)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 5,
            padding:5
        },
        leaveFamilyButtonText: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize: 13,
            color:"white"
        }
    })
    
    return (
        <View style={styles.familySwitcher}>

            {/* <Text style={styles.sampleText}>This is the family switcher</Text> */}


            <FlatList
                data={sampleRoles}
                keyExtractor={(item) => item.family}
                style={{width:"100%"}}
                contentContainerStyle={styles.rolesFlatlist}
                renderItem={({ item, index }) => { 
                    if (selectedIndex === index) {
                        return (
                            <View style={styles.selectedRole}>
                                <View style={styles.selectedRoleTextSection}>
                                    <Text style={styles.selectedRoleFamilyText}>The {item.family} family</Text>
                                    <Text style={styles.selectedRoleRoleText}>Role : {item.role}</Text>
                                </View>
                                <View style={styles.selectedRoleLeaveSection}>
                                    <Pressable
                                        style={styles.leaveFamilyButton}
                                        onPress={() => {
                                            props.displayModal({
                                                title: "Leave family ?",
                                                text: "Are you sure you wish to drop this family ? If you wish to be a part of it again, then you will have to request access again. Click below to continue.",
                                                buttons: [{
                                                    buttonText: "CANCEL",
                                                    buttonTextColor: "black",
                                                    buttonBackgroundColor: "transparent",
                                                    onButtonClick: () => {
                                                        props.closeModal();
                                                    }
                                                },
                                                {
                                                    buttonText: "LEAVE FAMILY",
                                                    buttonTextColor: "white",
                                                    buttonBackgroundColor: "rgb(200,0,0)",
                                                    onButtonClick: () => {
                                                        console.log("A leave-family request was generated");
                                                        props.closeModal();
                                                    }
                                                }]
                                            });
                                        }}>
                                        <Text style={styles.leaveFamilyButtonText}>Leave Family</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )
                    }
                    return (
                        <Pressable
                            style={styles.role}
                            onPress={() => {
                                props.displayModal({
                                    title: `Switch to the ${item.family} family ?`,
                                    text: `Are you sure you want to switch from your current family to the ${item.family} family ? If you are an admin here, then your second-in-command gets your privileges. If you are a guest, then no changes occur.`,
                                    buttons: [{
                                        buttonText: "CANCEL",
                                        buttonTextColor: "black",
                                        buttonBackgroundColor: "transparent",
                                        onButtonClick: () => {
                                            props.closeModal();
                                        }
                                    },
                                    {
                                        buttonText: "SWITCH",
                                        buttonTextColor: "white",
                                        buttonBackgroundColor: "rgb(0,150,0)",
                                        onButtonClick: () => {
                                            setSelectedIndex(index);
                                            props.closeModal();
                                        }
                                    }]
                                });
                        }}>
                            <View style={styles.roleTextSection}>
                                <Text style={styles.roleFamilyText}>The {item.family} family</Text>
                                <Text style={styles.roleRoleText}>Role : {item.role}</Text>
                            </View>
                            <View style={styles.roleLeaveSection}>
                                <Pressable
                                    style={styles.leaveFamilyButton}
                                    onPress={(event) => {
                                        event.stopPropagation();
                                        props.displayModal({
                                            title: "Leave family ?",
                                            text: "Are you sure you wish to drop this family ? If you wish to be a part of it again, then you will have to request access again. Click below to continue.",
                                            buttons: [{
                                                buttonText: "CANCEL",
                                                buttonTextColor: "black",
                                                buttonBackgroundColor: "transparent",
                                                onButtonClick: () => {
                                                    props.closeModal();
                                                }
                                            },
                                            {
                                                buttonText: "LEAVE FAMILY",
                                                buttonTextColor: "white",
                                                buttonBackgroundColor: "rgb(200,0,0)",
                                                onButtonClick: () => {
                                                    console.log("A leave-family request was generated");
                                                    props.closeModal();
                                                }
                                            }]
                                        });
                                    }}>
                                    <Text style={styles.leaveFamilyButtonText}>Leave Family</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    )
                }} />
        
        </View>
    )
}