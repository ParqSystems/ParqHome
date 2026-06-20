import React from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Image
} from "react-native";
import { useState, useEffect } from "react";
import  AsyncStorage  from "@react-native-async-storage/async-storage";



export default function PasswordChanger(props) {


    const [oldPassword, setOldPassword] = useState("");
    const [newPassword1, setNewPassword1] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [showPassword, setShowPassword] = useState(false);


    const trialErrorState = {
        oldPassword: { error: true, message: "This is the old password error" },
        newPassword1: { error: true, message: "This is the new password error" },
        newPassword2: { error: true, message: "This is the re-type new password error" }
    };

    const initialErrorState = {
        oldPassword: { error: false, message: "" },
        newPassword1: { error: false, message: "" },
        newPassword2: {error:false, message:""}
    }


    const [errors, setErrors] = useState(initialErrorState);


    let passwordRules= {
        isMinimumLength: newPassword1.length >= 8,
        containsDigit: /[0-9]/.test(newPassword1),
        containsUpperCaseLetter: /[A-Z]/.test(newPassword1),
        containsSymbol: /[^a-zA-Z0-9]/.test(newPassword1)
    }

    const changePassword = async () => {

        setErrors(initialErrorState);

        let hasError = false;
        if (!oldPassword.trim()) {
            setErrors((prev) => ({
                ...prev,
                oldPassword: {
                    error: true,
                    message: "Old password is required"
                }
            }));
            hasError = true;
        }
        if (!newPassword1.trim()) {
            setErrors((prev) => ({
                ...prev,
                newPassword1: {
                    error: true,
                    message: "Entering new password is mandatory"
                }
            }));
            hasError = true;
        }

        if (!passwordRules.containsDigit ||
            !passwordRules.containsSymbol ||
            !passwordRules.containsUpperCaseLetter ||
            !passwordRules.isMinimumLength) {
            setErrors((prev) => ({
                ...prev,
                newPassword1: {
                    error: true,
                    message: "Password does not satisfy the given rules"
                }
            }));
            hasError = true;
            }

        if (!newPassword2.trim()) {
            setErrors((prev) => ({
                ...prev,
                newPassword2: {
                    error: true,
                    message: "Re-entering new password is mandatory"
                }
            }));
            hasError = true;
        }

        if (newPassword1 !== newPassword2) {
            setErrors((prev) => ({
                ...prev,
                newPassword1: {
                    error: true,
                    message: "Passwords are not matching"
                },
                newPassword2: {
                    error: true,
                    message: "Passwords are not matching"
                }
            }));
            hasError = true;
        }

        if (hasError) {
            return;
        }

        try {
            const accessToken = await AsyncStorage.getItem("accessToken");
            const response = await fetch("http://localhost:5000/api/dashboard/changePassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `bearer ${accessToken}`
                },
                body: JSON.stringify({oldPassword, newPassword:newPassword1})
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.oldPasswordIncorrect) {
                    //display old password incorrect modal
                    props.displayModal({
                        text: "Old password is incorrect",
                        textColor: "white",
                        backgroundColor: "red",
                        displayDuration: 1.5
                    });
                    return;
                }
                else {
                    //display generic error modal
                    props.displayModal({
                        text: "An error occured while updating password",
                        textColor: "white",
                        backgroundColor: "red",
                        displayDuration: 1.5
                    });
                    return;
                }
            }
            

            //display success modal
            props.displayModal({
                text: "Password updated successfully",
                textColor: "white",
                backgroundColor: "green",
                displayDuration: 1.5
            });
            props.setDashboardContent("editProfile");
        }
        catch (error) {
            console.log("An error occured while updating password : ");
            console.log(error);
            //display error modal
            props.displayModal({
                        text: "An internal server error occured while updating password",
                        textColor: "white",
                        backgroundColor: "red",
                        displayDuration: 1.5
                    });
        }


    }


    const styles = StyleSheet.create({
        passwordChanger: {
            flex: 1,
            // border: "1px solid white",
            justifyContent: "center",
            alignItems: "center"
        },
        sampleText: {
            color:"white"
        },
        inputGroup: {
            width: "90%",
            marginBottom:20
        },
        label: {
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            fontFamily: "Helvetica",
            marginBottom:5
        },
        input: {
            padding: 10,
            borderRadius: 5,
            backgroundColor:"white"
        },
        redInput: {
            padding: 10,
            borderRadius: 5,
            backgroundColor: "white",
            borderColor: "red",
            borderWidth:3
        },
        passwordRulesSection: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems:"center"
        },
        passwordSectionIconContainer: {
            width: "40%",
            height:"100%",
            justifyContent: "center",
            alignItems:"center"
        },
        showPasswordIcon: {
            height: 40,
            width:40
        },
        verticalDivider: {
            border: "1px solid white",
            height: "100%"
        },
        passwordRulesList: {
            marginLeft:10
        },
        passwordRulesIntroText: {
            color: "white",
            fontSize:13
        },
        redRule: {
            fontSize: 12,
            color: "red",
            transition:"color 0.5s"
        },
        greenRule: {
            fontSize: 12,
            color: "lime",
            transition:"color 0.5s"
        },
        showPasswordText: {
            color: "white",
            // fontWeight: 700,
            fontSize: 12,
            marginTop:10
        },
        changePasswordButton: {
            backgroundColor: "green",
            borderRadius: 10,
            padding: 10,
            height:50,
            justifyContent: "center",
            alignItems: "center",
            width: "80%",
            marginTop:80
        },
        changePasswordButtonText: {
            color: "black",
            fontFamily: "Helvetica",
            fontSize: 14,
            fontWeight:900
        },
        backArrowContainer: {
            // border: "1px solid white",
            width: "100%",
            // marginBottom: 10,
            position: "absolute",
            top: 0,
            // height:70
        },
        backArrowIcon: {
            height: 40,
            width:40
        },
        errorText: {
            color: "red",
            fontSize:13
        }
    });

    return (
        <View style={styles.passwordChanger}>
            {/* <Text style={styles.sampleText}>This is the password changer</Text> */}

            <View style={styles.backArrowContainer}>
                <Pressable style={styles.backArrow} onPress={()=>props.setDashboardContent("editProfile")}>
                    <Image source={require("./../../assets/back-arrow-svgrepo-com.png")} style={styles.backArrowIcon} />
                </Pressable>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Old Password</Text>
                <TextInput
                    style={errors.oldPassword.error ? styles.redInput : styles.input}
                    value={oldPassword}
                    onChangeText={(text) => {
                        setOldPassword(text);
                        setErrors((prev) => ({
                            ...prev,
                            oldPassword: { error: false, message: "" }
                        }));
                    }}
                    secureTextEntry={!showPassword} />
                {errors.oldPassword.error && <Text style={styles.errorText}>{errors.oldPassword.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={errors.newPassword1.error ? styles.redInput : styles.input}
                    value={newPassword1}
                    onChangeText={(text) => {
                        setNewPassword1(text);
                        setErrors((prev) => ({
                            ...prev,
                            newPassword1: { error: false, message: "" }
                        }));
                    }}
                    secureTextEntry={!showPassword} />
                {errors.newPassword1.error && <Text style={styles.errorText}>{errors.newPassword1.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Re-type new password</Text>
                <TextInput
                    style={errors.newPassword2.error ? styles.redInput : styles.input}
                    value={newPassword2}
                    onChangeText={(text) => {
                        setNewPassword2(text);
                        setErrors((prev) => ({
                            ...prev,
                            newPassword2: {error:false, message:""}
                        }))
                    }}
                    secureTextEntry={!showPassword} />
                {errors.newPassword2.error && <Text style={styles.errorText}>{errors.newPassword2.message}</Text>}
            </View>

            <View style={styles.passwordRulesSection}>
                <Pressable style={styles.passwordSectionIconContainer} onPress={()=>setShowPassword(prev=>!prev)}>
                    <Image
                        source={showPassword ?
                            require("./../../assets/eye-svgrepo-com.png")
                            :
                            require("./../../assets/eye-slash-svgrepo-com.png")}
                        style={styles.showPasswordIcon} />
                    <Text style={styles.showPasswordText}>{showPassword ? "Hide Password" : "Show Password"}</Text>
                </Pressable>
                    
                    <View style={styles.verticalDivider}></View>

                        <View style={styles.passwordRulesList}>
                            <Text style={styles.passwordRulesIntroText}>Please ensure that your password : </Text>
                            <Text style={passwordRules.isMinimumLength ? styles.greenRule : styles.redRule}>Is at least 8 characters long</Text>
                            <Text style={passwordRules.containsDigit ? styles.greenRule : styles.redRule}>Contains at least one digit</Text>
                            <Text style={passwordRules.containsUpperCaseLetter ? styles.greenRule : styles.redRule}>Contains at least one uppercase letter</Text>
                            <Text style={passwordRules.containsSymbol ? styles.greenRule : styles.redRule}>Contains at least one symbol</Text>
                        </View>
                    
                
            </View>


            <Pressable style={styles.changePasswordButton} onPress={changePassword}>
                <Text style={styles.changePasswordButtonText}>Change Password</Text>
            </Pressable>
        </View>
    )
}