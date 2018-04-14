import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  AsyncStorage } from 'react-native';
import {
  BarCodeScanner,
  Permissions } from 'expo';

export default class SnapItemView extends React.Component {

  static navigationOptions = {
    title: 'Scan QR Code',
  };

  state = {
    hasCameraPermission: null,
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({hasCameraPermission: status === 'granted'});
  }

  _handleBarCodeRead = ({ type, data }) => {
    const { replace } = this.props.navigation;

    AsyncStorage.getItem(data, (error, value) => {
      if(error) {
        alert(`Cannot find item for scanned qr code Error: ${error}`);
      } else if(!value) {
        alert(`Cannot find item for scanned qr code.`);
      } else {
        console.log(`found object: ${value}`)
        //this.setState({hasCameraPermission: false});
        replace('AddEditItem', { item: JSON.parse(value), update_list: this.props.navigation.state.params.update_list})
      }
    })
  }

  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <BarCodeScanner
            onBarCodeRead={this._handleBarCodeRead}
            style={StyleSheet.absoluteFill}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          />
        </View>
      );
    }
  }
}
