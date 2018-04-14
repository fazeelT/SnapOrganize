import React from 'react';
import { StackNavigator } from 'react-navigation';
import HomeScreen from './components/home-screen';
import ItemAddEdit from './components/item-add-edit';
import SnapItemView from './components/snap-item'

const RootStack = StackNavigator({
  Home: {
    screen: HomeScreen,
  },
  AddEditItem: {
    screen: ItemAddEdit,
  },
  SnapSearch: {
    screen: SnapItemView,
  },
});

export default class App extends React.Component {
  render() {
    return (
      <RootStack />
    );
  }
}
