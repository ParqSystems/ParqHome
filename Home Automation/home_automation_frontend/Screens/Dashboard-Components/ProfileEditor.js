import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput
} from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileEditor(props) {


    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const initialErrorState = {
        name: { error: false, message: "" },
        email: { error: false, message: "" },
        phone: { error: false, message: "" }
    }

    const trialErrorState = {
        name: { error: true, message: "This is the first error" },
        email: { error: true, message: "This is the second error" },
        phone: { error: true, message: "This is the third error" }
    }

    const [errors, setErrors] = useState(initialErrorState);

    


    const getProfile = async () => {
        try {
            const accessToken = await AsyncStorage.getItem("accessToken");
            const response = await fetch("http://localhost:5000/api/dashboard/getProfile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                // set error occured as true
            }
            const data = await response.json();

            setName(data.name);
            setEmail(data.email);
            setPhone(data.phone);
        }
        catch (error) {
            console.log("An error occured while getting user data : ");
            console.log(error);
            // set error occured as true
        }
    }

    const editProfile = async () => {

        let hasError = false;
        setErrors(initialErrorState);

        if (!name.trim()) {
            setErrors((prev) => ({
                ...prev,
                name: { error: true, message: "This is a required field" }
            }));
            hasError = true;
        }

        if (!phone.trim()) {
            setErrors((prev) => (
                {
                    ...prev,
                    phone: { error: true, message: "This is a required field" }
                }
            ));
            hasError = true;
        }
        if (phone.length !== 10) {
            setErrors((prev) => (
                {
                    ...prev,
                    phone: { error: true, message: "Enter a valid phone number" }
                }
            ));
            hasError = true;
        }

        if (!email.trim()) {
            setErrors((prev) => (
                {
                    ...prev,
                    email: { error: true, message: "This is a required field" }
                }
            ));
            hasError = true;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrors((prev) => (
                {
                    ...prev,
                    email: { error: true, message: "Enter a valid email ID" }
                }
            ));
            hasError = true;
        }

        if (hasError) {
            return;
        }

        try {
            const authToken = await AsyncStorage.getItem("accessToken");
            const response = await fetch("http://localhost:5000/api/dashboard/updateProfile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization:`bearer ${authToken}`
                },
                body: JSON.stringify({ email, phone, name })
            });

            if (!response.ok) {
                //display error modal
                props.displayModal({
                    displayDuration: 1.5,
                    text: "An error occured while updating profile",
                    textColor: "white",
                    backgroundColor: "red"
                });
                return;
            }

            //display success modal
            props.displayModal({
                displayDuration: 2,
                text: "Profile updated successfully",
                textColor: "white",
                backgroundColor: "green"
            }); 
        }
        catch (error) {
            console.log("An error occured while updating profile : ");
            console.log(error);
            //display error modal
            props.displayModal({
                    displayDuration: 1.5,
                    text: "An internal error occured while updating profile",
                    textColor: "white",
                    backgroundColor: "red"
                });
        }
    }


    useEffect(() => {
        getProfile();
    }, []);
    
    const styles = StyleSheet.create({
        profileEditor: {
            // border: "1px solid white",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems:"center"
        },
        sampleText: {
            color:"white"
        },
        inputGroup: {
            width: "80%",
            marginBottom:20
        },
        input: {
            borderRadius: 5,
            padding: 10,
            border: "1px solid white",
            backgroundColor: "white",
            width:"100%"
        },
        redInput: {
            borderRadius: 5,
            padding: 10,
            // border: "1px solid white",
            backgroundColor: "white",
            width: "100%",
            borderColor: "red",
            borderWidth: 3,
            borderColor:"red"
        },
        label: {
            color: "white",
            // fontWeight: 700,
            fontSize: 13,
            width: "100%",
            marginBottom:5
        },
        changePasswordButton: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // width: "90%",
            // border: "1px solid white",
            padding: 10,
            marginTop: 60,
            marginBottom:30
        },
        changePasswordButtonText: {
            fontFamily: "Helvetica",
            color: "rgb(0, 29, 250)",
            fontWeight: 900,
            fontSize: 16,
            fontStyle:"underline"
        },
        editProfileButton: {
            width: "60%",
            borderRadius: 10,
            padding: 10,
            backgroundColor: "rgb(0,180,0)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height:50
        },
        editProfileButtonText: {
            fontFamily: "Helvetica",
            fontWeight: 700,
            fontSize:14
        },
        errorText: {
            color: "red",
            fontWeight: 700,
            fontSize:12
        }
    })
    
    return (
        <View style={styles.profileEditor}>
            {/* <Text style={styles.sampleText}>This is the profile editor</Text> */}

            

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={errors.name.error ? styles.redInput : styles.input}
                    value={name}
                    onChangeText={(text) => { 
                        setName(text);
                        setErrors((prev) => ({
                            ...prev,
                            name: { error: false, message: "" }
                        }));
                    }} />
                {errors.name.error && <Text style={styles.errorText}>{errors.name.message}</Text>}
            </View>

            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email ID</Text>
                <TextInput
                    style={errors.email.error ? styles.redInput : styles.input}
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setErrors((prev) => ({
                            ...prev,
                            email: { error: false, message: "" }
                        }));
                    }} />
                {errors.email.error && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                    style={errors.phone.error ? styles.redInput : styles.input}
                    value={phone}
                    onChangeText={(text) => {
                        setPhone(text);
                        setErrors((prev) => ({
                            ...prev,
                            phone: { error: false, message: "" }
                        }));
                    }}
                    maxLength={10}
                    keyboardType="phone-pad" />
                {errors.phone.error && <Text style={styles.errorText}>{errors.phone.message}</Text>}
            </View>


            <Pressable style={styles.changePasswordButton} onPress={()=>props.setDashboardContent("passwordChanger")}>
                <Text style={styles.changePasswordButtonText}>Change Password</Text>
            </Pressable>


            <Pressable style={styles.editProfileButton} onPress={()=>editProfile()}>
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </Pressable>
        </View>
    )
}