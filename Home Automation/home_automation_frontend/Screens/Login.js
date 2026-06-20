import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Animated,
    Easing
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();



export default function Login({ navigation }) {
    
    


    const [request,response,promptAsync]=Google.useAuthRequest({
        webClientId: "400870844108-1br39plma61592fj9nbtovu1gk9j2ajq.apps.googleusercontent.com",
        responseType: "id_token",
        scopes: ["openid","profile","email"]
    });

    const [usernameInput,setUsernameInput] = useState("");
    const [password, setPassword] = useState("");


    const [errors, setErrors] = useState({
        usernameError: { error: false, errorMessage: "" },
        passwordError: { error: false, errorMessage: "" }
    });

    const [modal, setModal] = useState({ showModal: false, modalMessage: "", modalColor: "" });
    
    const [showPassword, setShowPassword] = useState(false);


    const [isOn, setIsOn] = useState(false);
    // const [isStable, setIsStable] = useState(false);


    const displayModal = (color,message) => {
        setModal({ showModal: true, modalMessage: message, modalColor:color});
        setTimeout(() => {
            setModal({ showModal: false, modalMessage: "" });
        }, 2000);
    }


    const sendTokenToBackend = async(idToken)=>{
        try{
            const response=await fetch("http://localhost:5000/api/auth/google",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({idToken})
            });

            const data=await response.json();


            if (response.ok) {
                await AsyncStorage.setItem("accessToken", data.accessToken);
                await AsyncStorage.setItem("refreshToken", data.refreshToken);
                console.log(data.user.email);
                await AsyncStorage.setItem("email", data.user.email);
                navigation.navigate("UserDashboard");
            }
            else{
                displayModal("red","Google login failed. Kindly try again!");
                console.log("Google auth failed");
            }
        }
        catch(error){
            displayModal("red","An internal error occured! Try again");
        }
    }


    const login = async () => {
        let loginFieldEmpty;
        if (!usernameInput.trim()) {
            setErrors(prev => ({
                ...prev,
                usernameError: { error: true, errorMessage: "Email/Phone is mandatory" }
            }));
            loginFieldEmpty = true;
        }
        if (!password.trim()) {
            setErrors((prev) => ({
                ...prev,
                passwordError: { error: true, errorMessage: "Password is mandatory" }
            }));
            loginFieldEmpty = true;
        }

        if (loginFieldEmpty) {
            return;
        }


        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username: usernameInput, password })
            });

            const data = await response.json();

            if (response.ok) {
                await AsyncStorage.setItem("accessToken", data.accessToken);
                await AsyncStorage.setItem("refreshToken", data.refreshToken);
                // await AsyncStorage.setItem("email", data.email);
                setUsernameInput("");
                setPassword("");
                navigation.navigate("UserDashboard");
            }
            else{
                if (data.usedGoogleSignup) {
                    displayModal("orange","You don't have a password yet! Continue using Google");
                    
                }
                else {
                    //show that password is incorrect
                    setErrors((prev) => ({
                        ...prev,
                        passwordError: {error:true, errorMessage:"Password incorrect"}
                    }))
                }
                return;
            }

            
        }
        catch (error) {
            displayModal("red","An internal server error occured. Please try again!");
            // console.log("Login error : " + JSON.parse(error));
        }

    }



    useEffect(() => {
        let timeouts = [];

        const flickerSequence = [
            20, 30, 40, 20, 30, 30, 40, 50 // irregular timing
        ];

        flickerSequence.forEach((delay, index) => {
            const t = setTimeout(() => {
            setIsOn(prev => !prev);
            }, flickerSequence.slice(0, index + 1).reduce((a, b) => a + b, 0));

            timeouts.push(t);
        });

        // Final stable ON
        const final = setTimeout(() => {
            setIsOn(true);
        }, 500);

        timeouts.push(final);

        return () => timeouts.forEach(clearTimeout);
    }, []);



    useEffect(() => {
        if (response?.type === "success") {
            const  id_token  = response?.params?.id_token;
            console.log("ID token : " + JSON.stringify(response.params.id_token));
            sendTokenToBackend(id_token);
        }
    }, [response]);





    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "black",
            justifyContent: "center",
            alignItems:"center"
        },
        logoContainer: {
            flexDirection: "row",
            marginBottom: 30,
            border:"1px solid white"
        },
        logo: {
            height: 100,
            width: 140,
            scale:1.2
        },
        parqText: {
            color: "rgb(242, 253, 23)", 
            fontSize: 50,
            fontFamily: "Courier",
            fontWeight: 900,
            textShadowColor: "rgb(242,253,23)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10,
        },
        homeText: {
            color: "white",
            fontSize: 50,
            fontFamily: "Courier",
            fontWeight:900
        },
        usernameInput: {
            borderStyle: "solid",
            borderRadius: 8,
            borderWidth:2,
            backgroundColor: "white",
            width: 250,
            height: 40,
            marginBottom: 20,
            padding: 10,
            fontFamily: "Teko-Bold",
            fontSize: 15
        },
        redUsernameInput:{
            borderStyle: "solid",
            borderRadius: 8,
            borderWidth: 3,
            borderColor:"red",
            backgroundColor: "white",
            width: 250,
            height: 40,
            // marginBottom: 20,
            padding: 10,
            fontFamily: "Teko-Bold",
            fontSize: 15
        },
        passwordInput: {
            borderStyle: "solid",
            borderRadius: 8,
            borderWidth:2,
            backgroundColor: "white",
            width: 250,
            height: 40,
            marginBottom:30,
            padding: 10,
            fontFamily: "Teko-Bold",
            fontSize:15
        },
        redPasswordInput: {
            borderStyle: "solid",
            borderRadius: 8,
            borderWidth: 3,
            borderColor:"red",
            backgroundColor: "white",
            width: 250,
            height: 40,
            // marginBottom:30,
            padding: 10,
            fontFamily: "Teko-Bold",
            fontSize:15
        },
        loginButton: {
            backgroundColor: "rgb(223, 243, 0)",
            width: 250,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            marginBottom:30
        },
        loginText: {
            fontSize: 20,
            fontWeight:800
        },
        dividerContainer: {
            // backgroundColor: "white",
            width: 250,
            justifyContent: "center",
            alignItems: "center",
            flexDirection:"row"
        },
        divider: {
            width: 100,
            borderColor: "white",
            borderStyle: "solid",
            height: 0,
            borderWidth:1
        },
        orText: {
            width: 30,
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textAlign:"center"
        },
        googleIconContainer: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            borderStyle: "solid",
            // borderColor: "white",
            borderWidth: 1,
            borderRadius:5,
            width: 200,
            height:70,
            marginTop: 0,
            padding: 10,
            // backgroundColor:"rgb(83, 83, 83)"
        },
        google: {
            height: 30,
            width: 30,
            marginRight: 20
        },
        googleText: {
            color: "white",
            textAlign: "center",
            fontSize:13
        },
        signupContainer: {
            flexDirection: "row",
            marginTop:10
        },
        firstTimeText: {
            color: "white",
            fontSize:15
        },
        signupText: {
            color: "rgb(35, 35, 255)",
            textDecorationLine: "underline",
            fontSize: 15,
            marginLeft: 5,
            fontWeight:500
        },
        requestAccessLink: {
            borderStyle: "solid",
            borderColor: "white",
            borderWidth: 1,
            borderRadius:10,
            backgroundColor: "white",
            width: 250,
            marginTop: 40,
            justifyContent: "center",
            alignItems: "center",
            padding: 20
        },
        requestAccessTextLarge: {
            fontSize: 20,
        },
        requestAccessTextSmall: {
            fontSize: 14,
            textAlign: "center"
        },
        redErrorText: {
            color: "red",
            fontSize: 12,
            textAlign: "left",
            width: 250,
            marginBottom:20
        },
        modal: {
            width: 300,
            backgroundColor: modal.modalColor,
            position: "absolute",
            top: 200,
            padding: 20,
            borderRadius:10
        },
        modalText: {
            fontWeight: 500,
            color:modal.modalColor === "red" ? "white" : "black"
        },
        showPasswordSection: {
            display: "flex",
            flexDirection: "row",
            // border: "1px solid white",
            width: 250,
            alignItems:"center"
        },
        showPasswordIcon: {
            height: 20,
            width:20
        },
        showPasswordText: {
            color: "white",
            marginLeft: 5,
            fontSize: 15,
            fontFamily:"Times New Roman"
        }
    });
    
    
    return (
        <View style={styles.container}>
            
            <View style={styles.logoContainer}>
                
                <Image source={require("./../assets/ParqHome-logo.jpeg")} alt="ParqHome" style={styles.logo} />
                
            </View>



            <TextInput
                style={errors.usernameError.error ? styles.redUsernameInput : styles.usernameInput}
                value={usernameInput}
                onChangeText={(text) => {
                    setUsernameInput(text);
                    setErrors((prev) => ({
                        ...prev,
                        usernameError: { error: false, errorMessage: "" }
                    }));
                }}
                placeholder="Email/Phone"
                placeholderTextColor="#999" />
            {errors.usernameError.error && <Text style={styles.redErrorText}>{errors.usernameError.errorMessage}</Text>}

            <TouchableOpacity style={styles.showPasswordSection} onPress={()=>setShowPassword((prev)=>!prev)}>
                <Image source={showPassword ? require("./../assets/eye-slash-svgrepo-com.svg") : require("./../assets/eye-svgrepo-com.svg")} style={styles.showPasswordIcon} />
                <Text style={styles.showPasswordText}>{showPassword ? "Hide password" : "Show password"}</Text>
            </TouchableOpacity>
            
            <TextInput
                style={errors.passwordError.error ? styles.redPasswordInput : styles.passwordInput}
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    setErrors((prev) => ({
                        ...prev,
                        passwordError: { error: false, errorMessage: "" }
                    }));
                }}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword} />
            {errors.passwordError.error && <Text style={styles.redErrorText}>{errors.passwordError.errorMessage}</Text>}
            

            <TouchableOpacity style={styles.loginButton} onPress={()=>login()}>
                <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
                <View style={styles.divider}></View>
                <Text style={styles.orText}>OR</Text>
                <View style={styles.divider}></View>
            </View>

            <TouchableOpacity style={styles.googleIconContainer} onPress={()=>promptAsync()}>
                <Image source={require("./../assets/google-color-svgrepo-com.svg")} style={styles.google} />
                <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
                <Text style={styles.firstTimeText}>First time here ? </Text>
                <TouchableOpacity style={styles.signupLink} onPress={()=>navigation.navigate("Signup")}>
                    <Text style={styles.signupText}>Sign up</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.requestAccessLink} onPress={() => navigation.navigate("RequestAccess")} activeOpacity={ 0.9}>
                <Text style={styles.requestAccessTextLarge}>Request Access</Text>
                <Text style={styles.requestAccessTextSmall}>as a family member/guest</Text>
            </TouchableOpacity>


            {modal.showModal && <View style={styles.modal}>
                <Text style={styles.modalText}>{modal.modalMessage}</Text>
            </View>}


        </View>
    )
}