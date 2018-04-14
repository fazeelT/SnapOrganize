import React from 'react';
import {
  StyleSheet,
  Text,
  Button,
  AsyncStorage,
  FlatList,
  View,
  Alert,
  TextInput,
  Platform } from 'react-native';
import {
  Cell,
  Separator } from 'react-native-tableview-simple';
import Swipeable from 'react-native-swipeable';
import { AdMobBanner } from 'expo';
import { admobKeys } from '../config.js';

const styles = StyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20
  },
  textInputStyleClass:{
    textAlign: 'center',
    height: 40,
    borderWidth: 1,
    borderColor: '#009688',
    borderRadius: 7 ,
    backgroundColor : "#FFFFFF",
    flex: 2
  },
});

export default class HomeScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      rightActionActivated: false
    };

    this.arrayholder = [] ;
  }

  componentDidMount() {
    this.props.navigation.setParams({ update_list: this._reloadItems })
    this._reloadItems();
  }

  static navigationOptions = ({ navigation }) => ({
    title: 'All items',
    headerRight: <Button title="Add" onPress={() => navigation.navigate("AddEditItem", {item: {}, update_list: navigation.state.params.update_list})} />
  });

  _reloadItems = () => {
    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {
        this.arrayholder = stores.map((result, i, store) => JSON.parse(store[i][1]))
        this._setItems(this.arrayholder)
      });
    });
  }

  _searchFilterFunction = (text) => {

    const newData = this.arrayholder.filter(function(item){
      const itemData = item.itemName.toUpperCase()
      const textData = text.toUpperCase()
      return itemData.indexOf(textData) > -1
    })
    this._setItems(newData)
  }

  _deleteItem = (item) => {
    AsyncStorage.removeItem(item.key, (error) => {

      if(error) {
        Alert.alert('Error!', `Error in delete ${error}`)
      }
      else {
        this.arrayholder = this._remove(this.arrayholder, item);
        this._setItems(this.arrayholder)
      }
    })
  }

  _setItems = (allItems) => {
    this.setState({
      items: allItems.slice(0)
    })
  }

  _remove = (array, element) => {
    return array.filter(e => e !== element);
  }

  render() {
    const { navigate } = this.props.navigation;
    const {rightActionActivated} = this.state;
    let adUnitId = Platform.OS === 'ios'
    ? admobKeys.ios
    : admobKeys.android

    return (
      <View style={{flex: 1}}>
        <View style={{flexDirection: 'row'}}>
          <TextInput
            style={styles.textInputStyleClass}
            onChangeText={(text) => this._searchFilterFunction(text)}
            value={this.state.text}
            underlineColorAndroid='transparent'
            placeholder="Search Here"/>
          <Button
            title="scan"
            onPress={() => navigate('SnapSearch', {update_list: this._reloadItems})} />
          </View>
          <FlatList
            keyExtractor={(item, index) => item.key}
            data={this.state.items}
            renderItem={({ item, separators }) =>
            <Swipeable
              rightContent={
                <View style={[styles.button, {backgroundColor: rightActionActivated ? 'red' : 'lightgoldenrodyellow'}]}>
                  {rightActionActivated ?
                    <Text>Relase to delete!</Text> :
                    <Text>keep pulling!</Text>}
                  </View>
                }
                onRightActionActivate={() => this.setState({rightActionActivated: true})}
                onRightActionDeactivate={() => this.setState({rightActionActivated: false})}
                onRightActionComplete={() => this._deleteItem(item)}
                >
                  <Cell
                    title={item.itemName}
                    onPress= {
                      () => navigate('AddEditItem', { item: item, update_list: this._reloadItems})
                    }
                    onHighlightRow={separators.highlight}
                    onUnHighlightRow={separators.unhighlight}
                  />
                </Swipeable>
              }
              ItemSeparatorComponent={({ highlighted }) =>
              <Separator isHidden={highlighted} />}
            />
            <AdMobBanner
              bannerSize="smartBannerPortrait"
              adUnitID={adUnitId}
              testDeviceID="EMULATOR"
              didFailToReceiveAdWithError={this.bannerError} />
            </View>
          );
        }
      }
