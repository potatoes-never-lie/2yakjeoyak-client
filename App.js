import React from 'react';
import { View, Image, Button, Platform, PermissionsAndroid } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const SERVER_URL = 'https://a01ecbe37a14.ngrok.io';

const createFormData = (photo) => {
  const data = new FormData();
  data.append('photo', {
    name: photo.fileName,
    type: photo.type,
    uri: Platform.OS === 'android'? photo.uri : photo.uri.replace('file://', ''),
  });
  console.log(data)
  return data;
};

const App = () => {
  const [photo, setPhoto] = React.useState(null);
  const [info, setInfo]=React.useState(null);

  const requestCameraPermission = async () => {
    try {
      const granted =await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "App Camera Permission",
          message:"App needs access to your camera ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Camera permission given");
        return true;
      } else {
        console.log("Camera permission denied");
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleChoosePhoto = () => {
    launchImageLibrary({ includeBase64: true }, (response) => {
      //console.log(response.assets[0].base64);
      if (response) {
        setPhoto(response)
      }
    });
  };

  const handleTakePhoto= async ()=>{
    const hasPermission=await requestCameraPermission();
    if (!hasPermission){
      return;
    }
    else{
      launchCamera({mediaType:'photo', saveToPhotos:true, includeBase64: true, quality: 1}, async (response)=>{
        if (response.didCancel){
          console.log('User cancelled taking photo');
          alert('user cancelled taking photo');
        }
        else if (response.error){
          console.log('error',response.error);
          alert('error',response.error);
        } else{
          setPhoto(response);
        }
      });
    }
  };

  const handleUploadPhoto = () => {
    fetch(`${SERVER_URL}/predict`, {
      method: 'POST',
      headers: {
        Accept: 'application/json;indent=4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        photo:photo.assets[0].base64
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("upload success");
        console.log(response.content)
        setInfo(JSON.parse(response.content));
        //console.log(info['주의사항 경고']);
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {photo && (
        <>
          <Image
            source={{ uri: photo.uri }}
            style={{ width: 300, height: 300 }}
          />
          <Button title="Upload Photo" onPress={handleUploadPhoto} />
        </>
      )}
      <Button title="Choose Photo" onPress={handleChoosePhoto} />
      <Button title="Take Photo" onPress={handleTakePhoto} />
    </View>
  );
};

export default App;