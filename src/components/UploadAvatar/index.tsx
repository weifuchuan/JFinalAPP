import React from 'react'; 
import {inject, observer} from 'mobx-react'
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BACK_WHITE, ICON_BLUE } from '../base/color';
import { Toolbar } from 'react-native-material-ui'; 
import Router from '../Router';
import WebView from '../base/WebView';

@inject("store")
@observer
export default class UploadAvatar extends React.Component{
  render(){
    return (
      <View style={styles.container} >
        <Toolbar
					leftElement={'arrow-back'}
					centerElement={"上传头像"}
					onLeftElementPress={() => Router.pop()}
					style={{ container: { backgroundColor: ICON_BLUE } }}
				/>
        <WebView
          source={{html:``, baseUrl:""}}
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