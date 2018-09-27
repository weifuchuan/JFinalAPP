import React from 'react'; 
import {inject, observer} from 'mobx-react'
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BACK_WHITE, ICON_BLUE } from '../base/color';
import { Toolbar } from 'react-native-material-ui'; 
import Router from '../Router'; 

@inject("store")
@observer
export default class UpdatePassword extends React.Component{
  render(){
    return (
      <View style={styles.container} >
        <Toolbar
					leftElement={'arrow-back'}
					centerElement={"修改密码"}
					onLeftElementPress={() => Router.pop()}
					style={{ container: { backgroundColor: ICON_BLUE } }}
				/>
         
      </View>
    )
  }

  
}

const styles = StyleSheet.create({
  container:{
    flex:1, 
    backgroundColor:BACK_WHITE, 
  } as ViewStyle
})