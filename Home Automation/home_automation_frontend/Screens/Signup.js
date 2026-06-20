import React from "react";
import {
    Text,
    StyleSheet,
    View,
    Image,
    Pressable,
    TextInput
} from "react-native";
import { useState, useEffect } from "react";



export default function Signup({ navigation }) {

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [familyName, setFamilyName] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");

    const [isAdmin, setIsAdmin] = useState(true);


    const [showPassword, setShowPassword] = useState(false);
    // const [passwordRules, setPasswordRules] = useState({ isMinimumLength: false, containsDigit: false, containsUpperCaseLetter: false, containsSymbol:false});
    const [modal, setModal] = useState({ showModal: false, modalColor: "green", modalMessages: [] });
    const [errors, setErrors] = useState({
        emailError: {error:false,message:"Email is mandatory"},
        phoneError: {error:false,message:"Phone Number is mandatory"},
        nameError: {error:false,message:"Name is mandatory"},
        familyNameError: {error:false,message:"Family name is mandatory"},
        password1Error: {error:false,message:"Password is mandatory"},
        password2Error: {error:false,message:"Re-entering password is mandatory"}
    });


    let passwordRules= {
        isMinimumLength: password1.length >= 8,
        containsDigit: /[0-9]/.test(password1),
        containsUpperCaseLetter: /[A-Z]/.test(password1),
        containsSymbol: /[^a-zA-Z0-9]/.test(password1)
    }
    // setPasswordRules(newPasswordRules);


    const displayModal = (messages, color) => {
        setModal({
            showModal: true,
            modalColor: color,
            modalMessages: messages
        });

        setTimeout(() => {
            setModal(prev => ({
                ...prev,
                showModal: false
            }));
        }, Math.max(2000,500*messages.length));
    };
    
    const createAccount = async () => {

        let hasError = false;

        const newErrors = {
            emailError: { error: false, message: "" },
            phoneError: { error: false, message: "" },
            nameError: { error: false, message: "" },
            familyNameError: { error: false, message: "" },
            password1Error: { error: false, message: "" },
            password2Error: { error: false, message: "" }
        };

        if (!email.trim()) {
            newErrors.emailError = {
                error: true,
                message: "Email is mandatory"
            };
            hasError = true;
        } 
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            newErrors.emailError = {
                error: true,
                message: "Please enter a valid Email ID"
            };
            hasError = true;
        }

        if (!name.trim()) {
            newErrors.nameError = {
                error: true,
                message: "Name is mandatory"
            };
            hasError = true;
        } 
        else if (/[^a-zA-Z\s'-]/.test(name)) {
            newErrors.nameError = {
                error: true,
                message: "Name cannot contain symbols or digits"
            };
            hasError = true;
        }

        if (!phone.trim()) {
            newErrors.phoneError = {
                error: true,
                message: "Phone Number is mandatory"
            };
            hasError = true;
        }

        if (isAdmin) {
            if (!familyName.trim()) {
                newErrors.familyNameError = {
                    error: true,
                    message: "Family Name is mandatory"
                };
                hasError = true;
            }
            else if (/[^a-zA-Z\s'-]/.test(familyName)) {
                newErrors.familyNameError = {
                    error: true,
                    message: "Family name cannot contain symbols or digits"
                };
                hasError = true;
            }
        }

        if (!password1.trim()) {
            newErrors.password1Error = {
                error: true,
                message: "Setting password is mandatory"
            };
            hasError = true;
        }

        if (!password2.trim()) {
            newErrors.password2Error = {
                error: true,
                message: "Re-entering password is mandatory"
            };
            hasError = true;
        } 
        else if (password1 !== password2) {
            newErrors.password2Error = {
                error: true,
                message: "Passwords must match"
            };
            hasError = true;
        }

        if (!passwordRules.isMinimumLength || !passwordRules.containsDigit || !passwordRules.containsSymbol || !passwordRules.containsUpperCaseLetter) {
            newErrors.password1Error = {
                error: true,
                message: "Password does not meet required rules"
            }
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) {
            return
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/addNewUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim(),
                    phone: phone.trim(),
                    name: name.trim(),
                    password: password1,
                    familyName: isAdmin ? familyName.trim() : undefined
                })
            });

            const data = await response.json();

            if (!response.ok) {
                displayModal([data.message], "red");
                return
            }

            displayModal(["Account created successfully!"], "green");
            console.log("Access token : " + data.accessToken);
            console.log("Refresh token : " + data.refreshToken);
            setEmail("");
            setName("");
            setPhone("");
            setPassword1("");
            setPassword2("");
            setFamilyName("");
        }
        catch (error) {
            displayModal(["A network error occured. Please try again!"], "red");
            console.log("Network error : " + error);
        }



    };



    useEffect(() => {
        if (!isAdmin) {
            setFamilyName("");
        }
    }, [isAdmin]);


    const styles = StyleSheet.create({
        signup: {
            flex: 1,
            backgroundColor:"black"
        },
        signupHeader: {
            flexDirection: "row",
            height: 50,
            alignItems: "center",
            justifyContent:"center"
        },
        backButton: {
            height: 60,
            width: 60,
            position: "absolute",
            left: 0,
            justifyContent: "center",
            alignItems:"center"
        },
        backArrow: {
            height: 40,
            width:40
        },
        signupTitle: {
            color: "white",
            fontFamily: "Courier",
            fontSize: 25,
            fontWeight:700
        },
        signupInputs: {
            justifyContent: "center",
            alignItems:"center"
        },
        label: {
            color: "white",
            fontSize:15
        },
        input: {
            backgroundColor: "white",
            width: 250,
            height: 30,
            borderRadius: 5,
            marginBottom:10
        },
        disabledLabel: {
            color: "#949494",
            fontSize: 15
            // opacity:"0.5"
        },
        disabledInput:{
            backgroundColor: "#b1b1b1",
            width: 250,
            height: 30,
            borderRadius: 5,
            marginBottom: 10
            // opacity: 0.5
        },
        passwordCenter: {
            height: 80,
            width: 300,
            marginBottom: 5,
            flexDirection: "row",
            alignItems:"center"
        },
        passwordVisibility: {
            height: 80,
            width: 80,
            justifyContent: "center",
            alignItems:"center"
        },
        eyeIcon: {
            height: 35,
            width:35
        },
        passwordText: {
            fontSize: 10,
            color: "white",
            textAlign:"center"
        },
        verticalDivider: {
            width: 0,
            height: 70,
            borderColor: "white",
            borderWidth: 1,
            marginLeft: 10,
            marginRight:10
        },
        passwordRulesDisplay: {
            height: 80,
            width: 200,
            justifyContent:"center"
        },
        redRule: {
            color: "rgb(255, 0, 0)",
            fontSize: 12,
            transition:"color 0.5s"
        },
        greenRule: {
            color: "lime",
            fontSize: 12,
            transition:"color 0.5s"
        },
        rulesIntroText: {
            fontSize: 12,
            color:"white"
        },
        createAccountButton: {
            width: 250,
            height: 50,
            borderRadius: 5,
            borderColor: "white",
            borderWidth:1,
            marginTop: 20,
            justifyContent: "center",
            alignItems: "center"
        },
        createAccountText: {
            color: "white",
            fontSize: 15,
            fontFamily:"Helvetica"
        },
        createAccountButtonContainer: {
            justifyContent: "center",
            alignItems:"center"
        },
        redModal: {
            position: "absolute",
            backgroundColor: "rgb(250, 0, 0)",
            top: "20%",
            width: 300,
            alignSelf: "center",
            padding: 10,
            borderRadius: 10,
        },
        greenModal: {
            position: "absolute",
            backgroundColor: "rgb(0, 187, 0)",
            top: "20%",
            width: 300,
            alignSelf: "center",
            padding: 10,
            borderRadius: 10,
            justifyContent: "center",
            alignItems:"center"
        },
        singleModalText: {
            fontFamily: "Helvetica",
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            marginBottom:15
        },
        errorInputText: {
            color: "red",
            fontSize: 10
        },
        labelGroup: {
            width: 250,
        },
        redInput: {
            backgroundColor: "white",
            width: 250,
            height: 30,
            borderRadius: 5,
            marginBottom: 0,
            borderColor: "red",
            borderWidth:2
        },
        roleToggleSection: {
            width: 250,
            height: 50,
            // borderColor: "white",
            // borderWidth: 2,
            flexDirection: "row",
            justifyContent: "center",
            alignItems:"center"
        },
        roleToggleContainer: {
            height: 50,
            width: 100,
            justifyContent:"center",
            alignItems:"center"
        },
        roleToggle: {
            width:100,
            borderColor: "white",
            borderWidth: 1,
            borderStyle:"solid",
            borderRadius: 10,
            height: 40,
            flexDirection: "row",
            overflow:"hidden"
        },
        memberOption: {
            width: 50,
            height: 40,
            justifyContent: "center",
            alignItems:"center"
        },
        selectedMemberOption: {
            width: 50,
            height: 40,
            backgroundColor: "white",
            justifyContent: "center",
            alignItems:"center"
        },
        adminOption: {
            width: 50,
            height: 40,
            justifyContent: "center",
            alignItems:"center"
        },
        selectedAdminOption: {
            width: 50,
            height: 40,
            backgroundColor: "white",
            justifyContent: "center",
            alignItems:"center"
        },
        option: {
            height: 20,
            width: 20,
            transition: "height 0.3s, width 0.3s"
        },
        selectedOption: {
            height: 30,
            width: 30,
            transition: "height 0.3s, width 0.3s"
        },
        roleToggleTextContainer: {
            width: 150,
            height: 50,
            justifyContent: "center",
            // alignItems: "center",
            paddingLeft: 10
        },
        roleToggleText: {
            color:"white"
        }
    });


    return (
        <View style={styles.signup}>
            
            <View style={styles.signupHeader}>
                <Pressable style={styles.backButton} onPress={()=>navigation.goBack()}>
                    <Image source={require("./../assets/back-svgrepo-com.svg")} style={styles.backArrow} />
                </Pressable>
                <Text style={styles.signupTitle}>Signup</Text>
            </View>

            



            <View style={styles.signupInputs}>


                <View style={styles.labelGroup}>
                    <Text style={styles.label}>
                        Email ID
                    </Text>
                    {errors.emailError.error && <Text style={styles.errorInputText}>
                        {errors.emailError.message}
                    </Text>}
                </View>
                <TextInput
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (errors.emailError.error) {
                            setErrors((prev) => (
                                {
                                    ...prev,
                                    emailError: { error: false, message: "" }
                                }
                            ));
                        }
                    }}
                    style={errors.emailError.error ? styles.redInput : styles.input} />
                


                <View style={styles.labelGroup}>
                    <Text style={styles.label}>
                        Phone
                    </Text>
                    {errors.phoneError.error && <Text style={styles.errorInputText}>
                        {errors.phoneError.message}
                    </Text>}
                </View>
                <TextInput
                    value={phone}
                    onChangeText={(text) => {
                        setPhone(text);
                        if (errors.phoneError.error) {
                            setErrors((prev) => (
                                {
                                    ...prev,
                                    phoneError: { error: false, message: "" }
                                }
                            ));
                        }
                    }}
                    style={errors.phoneError.error ? styles.redInput : styles.input}
                    keyboardType="phone-pad"
                    maxLength={10} />
                


                <View style={styles.labelGroup}>
                    <Text style={styles.label}>
                        Name
                    </Text>
                    {errors.nameError.error && <Text style={styles.errorInputText}>
                        {errors.nameError.message}
                    </Text>}
                </View>
                <TextInput
                    value={name}
                    onChangeText={(text) => {
                        setName(text);
                        if (errors.nameError.error) {
                            setErrors((prev) => (
                                {
                                    ...prev,
                                    nameError: { error: false, message: "" }
                                }
                            ));
                        }
                    }}
                    style={errors.nameError.error ? styles.redInput : styles.input} />
                

                <View style={styles.roleToggleSection}>
                    <View style={styles.roleToggleContainer}>
                        <View style={styles.roleToggle}>
                            <Pressable style={isAdmin ? styles.memberOption : styles.selectedMemberOption} onPress={()=>setIsAdmin(false)}>
                                <Image source={isAdmin ? require("./../assets/memberOption.svg") : require("./../assets/selectedMemberOption.svg")} style={isAdmin ? styles.option : styles.selectedOption} />
                            </Pressable>
                            <Pressable style={isAdmin ? styles.selectedAdminOption : styles.adminOption} onPress={()=>setIsAdmin(true)}>
                                <Image source={isAdmin ? require("./../assets/selectedAdminOption.svg") : require("./../assets/adminOption.svg")} style={isAdmin ? styles.selectedOption : styles.option} />
                            </Pressable>
                        </View>
                    </View>
                    <View style={styles.roleToggleTextContainer}>
                        <Text style={styles.roleToggleText}>{isAdmin ? "Start new family" : "Just create an account"}</Text>
                    </View>
                </View>




                <View style={styles.labelGroup}>
                    <Text style={isAdmin ? styles.label : styles.disabledLabel}>
                        Family Name
                    </Text>
                    {errors.familyNameError.error && isAdmin && <Text style={styles.errorInputText}>
                        {errors.familyNameError.message}
                    </Text>}
                </View>
                <TextInput
                    value={familyName}
                    onChangeText={(text) => {
                        setFamilyName(text);
                        if (errors.familyNameError.error) {
                            setErrors((prev) => (
                                {
                                    ...prev,
                                    familyNameError: { error: false, message: "" }
                                }
                            ));
                        }
                    }}
                    editable={isAdmin}
                    placeholder={!isAdmin ? "Only for family admins!" : ""}
                    style={!isAdmin ? styles.disabledInput : errors.familyNameError.error ? styles.redInput : styles.input} />

                
                <View style={styles.labelGroup}>
                    <Text style={styles.label}>
                        Password
                    </Text>
                    {errors.password1Error.error && <Text style={styles.errorInputText}>
                        {errors.password1Error.message}
                    </Text>}
                </View>
                <TextInput
                    style={errors.password1Error.error ? styles.redInput : styles.input}
                    value={password1}
                    onChangeText={(text) => {
                        setPassword1(text);
                        if (errors.password1Error.error) {
                            setErrors((prev) => (
                                {
                                    ...prev,
                                    password1Error: { error: false, message: "" }
                                }
                            ));
                        }
                    }}
                    secureTextEntry={!showPassword} />
                


                <View style={styles.passwordCenter}>
                    
                    <Pressable style={styles.passwordVisibility} onPress={() => setShowPassword(prev => !prev)}>
                        <Image
                            source={showPassword ?
                                require("./../assets/eye-slash-svgrepo-com.svg")
                                :
                                require("./../assets/eye-svgrepo-com.svg")
                            }
                            style={styles.eyeIcon} />
                        <Text style={styles.passwordText}>
                            {showPassword ? "Hide Password" : "Show Password"}
                        </Text>
                    </Pressable>

                    <View style={styles.verticalDivider}></View>
                
                    <View style={styles.passwordRulesDisplay}>
                        <Text style={styles.rulesIntroText}>Please ensure that your password :</Text>
                        <Text style={passwordRules.isMinimumLength ? styles.greenRule : styles.redRule}>Is at least 8 characters long</Text>
                        <Text style={passwordRules.containsDigit ? styles.greenRule : styles.redRule}>Contains at least one digit</Text>
                        <Text style={passwordRules.containsUpperCaseLetter ? styles.greenRule : styles.redRule}>Contains at least one uppercase letter</Text>
                        <Text style={passwordRules.containsSymbol ? styles.greenRule : styles.redRule}>Contains at least one symbol</Text>
                    </View>
                
                </View>

                

                
                <View style={styles.labelGroup}>
                    <Text style={styles.label}>
                        Re-enter Password
                    </Text>
                    {errors.password2Error.error && <Text style={styles.errorInputText}>
                        {errors.password2Error.message}
                    </Text>}
                </View>
                <TextInput
                    style={errors.password2Error.error ? styles.redInput : styles.input}
                    value={password2}
                    onChangeText={(text) => {
                        setPassword2(text);
                        if (errors.password2Error.error) {
                            setErrors((prev) => (
                                {
                                    ...prev,
                                    password2Error: { error: false, message: "" }
                                }
                            ));
                        }
                    }}
                    secureTextEntry={!showPassword} />
            </View>


            <View style={styles.createAccountButtonContainer}>
                <Pressable style={styles.createAccountButton} onPress={() => createAccount()}>
                    <Text style={styles.createAccountText}>Create Account and Login</Text>
                </Pressable>
            </View>


            {modal.showModal &&
                <View style={modal.modalColor === "green" ? styles.greenModal : styles.redModal}>
                    {modal.modalMessages.map((singleModalText,index) => {
                        return (
                            <Text style={styles.singleModalText} key={index}>{singleModalText}</Text>
                        )
                    })}
                </View>}
        </View>
    )
}