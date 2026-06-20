import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    TextInput
} from "react-native";
import { useState, useEffect } from "react";


export default function RequestAccess({ navigation }) {

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [familyId, setFamilyId] = useState("");


    const [modal, setModal] = useState({ showModal: false, modalColor: "green", modalMessages: [] });

    const [userFound, setUserFound] = useState(false);
    const [emailCheckLoading, setEmailCheckLoading] = useState(false);

    const [familyName, setFamilyName] = useState("");
    const [familyFound, setFamilyFound] = useState(false);


    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState({
        emailError: { error: false, message: "" },
        phoneError: { error: false, message: "" },
        nameError: { error: false, message: "" },
        password1Error: { error: false, message: "" },
        password2Error: { error: false, message: "" },
        familyIdError: { error:false, message: "" },
    });

    


    let passwordRules= {
        isMinimumLength: password1.length >= 8,
        containsDigit: /[0-9]/.test(password1),
        containsUpperCaseLetter: /[A-Z]/.test(password1),
        containsSymbol: /[^a-zA-Z0-9]/.test(password1)
    }


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


    const requestAccess = async () => {
        console.log("Access has been requested");
        
        
        let hasError = false;

        const newErrors = {
            emailError: { error: false, message: "" },
            phoneError: { error: false, message: "" },
            nameError: { error: false, message: "" },
            password1Error: { error: false, message: "" },
            password2Error: { error: false, message: "" },
            familyIdError: { error: false, message: "" }
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

        else if (phone.length !== 10) {
            newErrors.phoneError = {
                error: true,
                message: "Phone number must be exactly 10 digits"
            };
            hasError = true;
        }

        

        if (!userFound) {
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
        }

        if (!familyId.trim()) {
            newErrors.familyIdError = {
                error: true,
                message:"Entering family ID is mandatory"
            }
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) {
            return
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/generateMemberRequest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    phone,
                    name,
                    password: userFound ? undefined : password1,
                    familyId
                })
            });

            const data = await response.json();
            if (!response.ok) {
                //show error modal
                displayModal([data.message], "red");
                return;
            }
            //show success modal
            displayModal(["Request generated successfully"], "green");
            setEmail("");
            setName("");
            setPhone("");
            setPassword1("");
            setPassword2("");
            setFamilyId("");


        }
        catch (error) {
            console.log("An error occured : " + error);
            //show error modal
            displayModal(["An error occured. Please try again"], "red");
        }
    }


    useEffect(() => {
        if (!email.trim()) {
            setUserFound(false);
            setName("");
            setPhone("");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setUserFound(false);
            setName("");
            setPhone("");
            return;
        }


        const timer = setTimeout(async () => {
            try {
                setEmailCheckLoading(true);
                const response = await fetch(`http://localhost:5000/api/auth/checkEmail/${email}`);
                const data = await response.json();
                if (data.exists) {
                    setUserFound(true);
                    setName(data.name);
                    setPhone(data.phone);
                }
                else {
                    setUserFound(false);
                    setName("");
                    setPhone("");
                }
            }
            catch (error) {
                console.error("Email check failed : " + error);
            }
            finally {
                setEmailCheckLoading(false);
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        }
    }, [email]);



    useEffect(() => {
        if (!familyId.trim()) {
            setFamilyName("");
            setFamilyFound(false);
            return;
        }

        const familyRegex = /^[A-Z]{3}-[0-9]{6}$/;

        if (!familyRegex.test(familyId)) {
            setFamilyName("");
            setFamilyFound(false);
            return;
        }


        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/auth/checkFamily/${familyId}`);
                const data = await response.json();
                if (data.exists) {
                    setFamilyName(data.familyName);
                    setFamilyFound(true);
                }
                else {
                    setFamilyName("");
                    setFamilyFound(false);
                    setErrors((prev) => (
                        {
                            ...prev,
                            familyIdError: { error: true, message: "Family not found! Cross-check family ID and try again." }
                        }
                    ));
                }
            }
            catch (error) {
                console.error("Family Check failed : " + error);
            }
        }, 500);


        return () => {
            clearTimeout(timer);
        }
    }, [familyId]);



    const styles = StyleSheet.create({
        requestAccess: {
            flex: 1,
            alignItems: "center",
            backgroundColor:"black"
        },
        requestAccessHeader: {
            height: 70,
            // borderColor: "white",
            // borderWidth: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            // marginBottom:10
        },
        backArrowContainer: {
            // borderColor: "white",
            // borderWidth: 1,
            height: 70,
            width: 70,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left:0
        },
        backArrowImage: {
            height: 40,
            width:40
        },
        requestAccessTitle: {
            color: "white",
            fontSize: 25,
            fontFamily: "Courier",
            fontWeight:700
        },
        requestAccessInputs: {
            justifyContent: "center",
            alignItems:"center"
        },
        label: {
            color: "white",
            fontSize: 15,
            width: 250,
            marginBottom:0
        },
        redLabel: {
            color: "red",
            fontSize: 10,
            width: 250,
            marginTop:0
        },
        input: {
            backgroundColor: "white",
            width: 250,
            height: 30,
            borderRadius: 5,
            marginBottom:10
        },
        redInput: {
            backgroundColor: "white",
            width: 250,
            height: 30,
            borderRadius: 5,
            marginBottom: 10,
            borderWidth: 2,
            borderColor:"red"
        },
        passwordCenter: {
            flexDirection:"row",
            // borderColor: "white",
            // borderWidth: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 5,
            marginBottom:5
        },
        passwordVisibility: {
            height: 70,
            width: 70,
            justifyContent: "center",
            alignItems:"center",
            // borderColor: "white",
            // borderWidth: 1
        },
        eyeIcon: {
            height: 30,
            width:30
        },
        showPasswordText: {
            color: "white",
            fontSize:10
        },
        verticalDivider: {
            borderColor: "white",
            borderWidth: 1,
            height: 70,
            width: 0,
            marginLeft: 10,
            marginRight:10
        },
        passwordRulesDisplay: {
            width:180
        },
        passwordRulesIntroText: {
            color:"white",
            fontSize: 11,
            marginBottom:5
        },
        redRule: {
            color: "rgb(255,0,0)",
            fontSize: 10,
            transition: "color 0.5s",
            fontWeight:500
        },
        greenRule: {
            color: "lime",
            fontSize: 10,
            transition: "color 0.5s",
            fontWeight:500
        },
        requestAccessButton: {
            borderRadius: 10,
            borderColor: "white",
            borderWidth:2,
            width: 250,
            height: 50,
            marginTop: 20,
            justifyContent: "center",
            alignItems:"center"
        },
        requestAccessText: {
            color:"white"
        },
        emailCheckText: {
            color: "white",
            fontSize: 10,
            width: 250,
            marginBottom:10
        },
        passwordSection: {
            justifyContent: "center",
            alignItems:"center"
        },
        userFoundSection: {
            width: 250,
            height: 200,
            // borderColor: "white",
            // borderWidth: 1,
            justifyContent: "center",
            alignItems:"center"
        },
        userFoundText: {
            color: "white",
            fontSize: 15,
            width: 150,
            textAlign: "center",
            color:"lime"
        },
        userFoundTextSmaller: {
            fontSize: 12,
            color: "white",
            width: 150,
            textAlign: "center",
            marginTop:10
        },
        verifiedUserIcon: {
            width: 50,
            height: 50,
            marginBottom:20
        },
        familyFoundText: {
            color: "lime",
            fontSize:10
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
        }
    })




    return (
        <View style={styles.requestAccess}>
            
            <View style={styles.requestAccessHeader}>
                <Pressable style={styles.backArrowContainer} onPress={()=>navigation.goBack()}>
                    <Image source={require("./../assets/back-svgrepo-com.svg")} style={styles.backArrowImage} />
                </Pressable>
                <Text style={styles.requestAccessTitle}>Request Access</Text>
            </View>


            <View style={styles.requestAccessInputs}>
                
                
                <Text style={styles.label}>Email ID</Text>
                {errors.emailError.error && <Text style={styles.redLabel}>{errors.emailError.message}</Text>}
                <TextInput
                    style={errors.emailError.error ? styles.redInput : styles.input}
                    onChangeText={(text) => {
                        setEmail(text);
                        setErrors((prev) => (
                            {
                                ...prev,
                                emailError: { error: false, message: "" }
                            }
                        ));
                    }}
                    value={email} />
                {emailCheckLoading && <Text style={styles.emailCheckText}>Verifying email in our system...</Text>}
                

                <Text style={styles.label}>Phone</Text>
                {errors.phoneError.error && <Text style={styles.redLabel}>{errors.phoneError.message}</Text>}
                <TextInput
                    style={errors.phoneError.error ? styles.redInput : styles.input}
                    onChangeText={(text) => {
                        setPhone(text);
                        setErrors((prev) => (
                            {
                                ...prev,
                                phoneError: { error: false, message: "" }
                            }
                        ));
                    }}
                    value={phone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={!userFound} />
                
                <Text style={styles.label}>Name</Text>
                {errors.nameError.error && <Text style={styles.redLabel}>{errors.nameError.message}</Text>}
                <TextInput
                    style={errors.nameError.error ? styles.redInput : styles.input}
                    onChangeText={(text) => {
                        setName(text);
                        setErrors((prev) => (
                            {
                                ...prev,
                                nameError: { error: false, message: "" }
                            }
                        ));
                    }}
                    value={name}
                    editable={!userFound} />
                
                {userFound ?
                    <View style={styles.userFoundSection}>
                        <Image source={require("./../assets/verified-user.svg")} style={styles.verifiedUserIcon} />
                        <Text style={styles.userFoundText}>You already have an account with us!</Text>
                        <Text style={styles.userFoundTextSmaller}>Requesting access using this account. Enter family ID to proceed.</Text>
                        {/* <Text style={styles.userFoundTextSmaller}>Enter Family ID to proceed</Text> */}
                    </View>
                    :
                    <View style={styles.passwordSection}>
                        <Text style={styles.label}>Password</Text>
                        {errors.password1Error.error && <Text style={styles.redLabel}>{errors.password1Error.message}</Text>}
                        <TextInput
                            style={errors.password1Error.error ? styles.redInput : styles.input}
                            onChangeText={(text) => {
                                setPassword1(text);
                                setErrors((prev) => (
                                    {
                                        ...prev,
                                        password1Error: { error: false, message: "" }
                                    }
                                ));
                            }}
                            value={password1}
                            secureTextEntry={!showPassword} />
                

                        <View style={styles.passwordCenter}>
                    
                    
                            <Pressable style={styles.passwordVisibility} onPress={() => setShowPassword(prev => !prev)}>
                                <Image source={showPassword ? require("./../assets/eye-slash-svgrepo-com.svg") : require("./../assets/eye-svgrepo-com.svg")} style={styles.eyeIcon} />
                                <Text style={styles.showPasswordText}>{showPassword ? "Hide Password" : "Show Password"}</Text>
                            </Pressable>


                            <View style={styles.verticalDivider}></View>


                            <View style={styles.passwordRulesDisplay}>
                                <Text style={styles.passwordRulesIntroText}>Please ensure that your password : </Text>
                                <Text style={passwordRules.isMinimumLength ? styles.greenRule : styles.redRule}>Is at least 8 characters long</Text>
                                <Text style={passwordRules.containsDigit ? styles.greenRule : styles.redRule}>Contains at least one digit</Text>
                                <Text style={passwordRules.containsUpperCaseLetter ? styles.greenRule : styles.redRule}>Contains at least one uppercase letter</Text>
                                <Text style={passwordRules.containsSymbol ? styles.greenRule : styles.redRule}>Contains at least one symbol</Text>
                            </View>
                        </View>
                
                        <Text style={styles.label}>Re-enter Password</Text>
                        {errors.password2Error.error && <Text style={styles.redLabel}>{errors.password2Error.message}</Text>}
                        <TextInput
                            style={errors.password2Error.error ? styles.redInput : styles.input}
                            onChangeText={(text) => {
                                setPassword2(text);
                                setErrors((prev) => (
                                    {
                                        ...prev,
                                        password2Error: { error: false, message: "" }
                                    }
                                ));
                            }}
                            value={password2}
                            secureTextEntry={!showPassword} />
                    </View>}
                
                <Text style={styles.label}>Family ID</Text>
                {errors.familyIdError.error && <Text style={styles.redLabel}>{errors.familyIdError.message}</Text>}
                <TextInput
                    style={errors.familyIdError.error ? styles.redInput : styles.input}
                    maxLength={10}
                    onChangeText={(text) => {
                        let cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                        if (cleaned.length > 3) {
                            cleaned = cleaned.slice(0, 3) + "-" + cleaned.slice(3, 9);
                        }
                        setFamilyId(cleaned);
                        setErrors((prev) => (
                            {
                                ...prev,
                                familyIdError: { error: false, message: "" }
                            }
                        ));
                    }}
                    value={familyId} />
                {familyFound && <Text style={styles.familyFoundText}>Family found : The {familyName} family</Text>}
            </View>

            <Pressable style={styles.requestAccessButton} onPress={()=>requestAccess()}>
                <Text style={styles.requestAccessText}>
                    {familyName.trim() ? `Request to join the ${familyName} family` : `Request to join...`}
                </Text>
            </Pressable>



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