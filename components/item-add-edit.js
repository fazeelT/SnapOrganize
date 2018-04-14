import React from 'react';
import {
  StyleSheet,
  View,
  Button,
  AsyncStorage,
  CameraRoll,
  Text,
  Alert,
  Platform,
  PixelRatio } from 'react-native';
import t from 'tcomb-form-native';
import QRCode from 'react-native-qrcode';
import { Ionicons } from '@expo/vector-icons';
import { takeSnapshotAsync, Permissions } from 'expo';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Form = t.form.Form;

const options = {
  fields: {
    itemName: {
      autoCorrect: false
    },
    notes: {
      multiline: true,
      stylesheet: {
        ...Form.stylesheet,
        textbox: {
          ...Form.stylesheet.textbox,
          normal: {
            ...Form.stylesheet.textbox.normal,
            height: 150
          },
          error: {
            ...Form.stylesheet.textbox.error,
            height: 150
          }
        }
      }
    },
    location: {
      multiline: true,
      stylesheet: {
        ...Form.stylesheet,
        textbox: {
          ...Form.stylesheet.textbox,
          normal: {
            ...Form.stylesheet.textbox.normal,
            height: 50
          },
          error: {
            ...Form.stylesheet.textbox.error,
            height: 50
          }
        }
      }
    },
    key: {
      hidden: true
    }
  }
};

const Item = t.struct({
  key: t.maybe(t.String),
  itemName: t.String,
  type: t.maybe(t.String),
  notes: t.maybe(t.String),
  location: t.String
});

export default class ItemAddEdit extends React.Component {
  state = {
    cameraRollUri: null,
    hasCameraRollPermission: null,
  }
  static navigationOptions = {
    title: 'Add/Edit Item',
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({hasCameraRollPermission: status === 'granted'});
  }

  handleSubmit = () => {
    const value = this._form.getValue(); // use that ref to get the form value
    if(!value) return;
    const key = value.key;
    const updated_value = key === null ? this.put_item_key(value) : value;

    // Save item
    AsyncStorage.setItem(updated_value.key, JSON.stringify(updated_value));

    //Reload the item list
    this.props.navigation.state.params.update_list()
    this.props.navigation.goBack();
  };

  _guid = () => {
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
    this.s4() + '-' + this.s4() + this.s4() + this.s4();
  };

  s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  };

  _saveQrCode = async () => {
    if(this.state.cameraRollUri){
      Alert.alert('Hurray!', 'QR code for this item is already saved')
      return;
    }
    const targetPixelCount = 500; // If you want full HD pictures
    const pixelRatio = PixelRatio.get(); // The pixel ratio of the device
    // pixels * pixelratio = targetPixelCount, so pixels = targetPixelCount / pixelRatio
    const pixels = targetPixelCount / pixelRatio;

    let result = await takeSnapshotAsync(this._qrCode, {
      format: "jpg",
      quality: 1,
      width: pixels,
      height: pixels,
    })

    let saveResult = await CameraRoll.saveToCameraRoll(result, 'photo');
    console.log(`image ${saveResult} saved to camera roll`)
    Alert.alert('Hurray!', 'QR code is saved to camera roll and can be shared or printed')
    this.setState({ cameraRollUri: saveResult });
  }

  render() {
    var item = this.props.navigation.state.params.item;
    var currItem = Object.keys(item).length === 0 ? {key: this._guid().toString()} : item;
    const { hasCameraRollPermission } = this.state;

    if (hasCameraRollPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    } else if (hasCameraRollPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
    return (
      <KeyboardAwareScrollView
      style={{ backgroundColor: '#4c69a5' }}
      resetScrollToCoords={{ x: 0, y: 0 }}
      contentContainerStyle={styles.container}
      scrollEnabled={true}
      enableOnAndroid={true}
      extraHeight={200}
      enableAutoAutomaticScroll={(Platform.OS === 'ios')}
    >
        <Form type={Item} options={options} ref={c => this._form = c} value={currItem}/>
        <View style={{alignItems: 'center'}}>
          <View
            collapsable={false}
            ref={ref => this._qrCode = ref}>
            <QRCode
              value={currItem.key}
              size={100}
              bgColor='black'
              fgColor='white'
            />
          </View>

          <Ionicons
            name="md-download"
            size={40}
            color="black"
            onPress={this._saveQrCode} />

          </View>
          <Button
            title="Save"
            onPress={this.handleSubmit}
            size={100}
          />
        </KeyboardAwareScrollView>
      );
    }
    }
  }

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#ffffff',
    },
  });
