'use strict'
import React, {
  PropTypes,
  Component,
} from 'react'

import {
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Platform,
} from 'react-native'

import emoji from 'emoji-datasource'

import {
  groupBy,
  orderBy,
  includes,
} from 'lodash/collection'

import {
  mapValues,
} from 'lodash/object'

//polyfil for android
require('string.fromcodepoint');

// i dont understand ANY of this but there's somethign called codepoints and surrogate pairs
// and this converts utf16 to a charachter in javascript. see more here:
//https://mathiasbynens.be/notes/javascript-unicode
//https://mathiasbynens.be/notes/javascript-escapes#unicode-code-point
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
const charFromUtf16 = utf16 => String.fromCodePoint(...utf16.split('-').map(u => '0x' + u))
const charFromEmojiObj = obj => charFromUtf16(obj.unified)
const blacklistedEmojis = ['white_frowning_face', 'keycap_star', 'eject']

const isAndroid = Platform.OS == 'android'
const letterSpacing = 10
const defaultEmojiSize = 30
const padding = 5
const filteredEmojis = emoji.filter(e => isAndroid ? !!e.google : !includes(blacklistedEmojis, e.short_name))
// sort emojis by 'sort_order' then group them into categories
const groupedAndSorted = groupBy(orderBy(filteredEmojis, 'sort_order'), 'category')
// convert the emoji object to a character
const emojisByCategory = mapValues(groupedAndSorted, group => group.map(charFromEmojiObj))

const CATEGORIES = ['People', 'Nature', 'Foods', 'Activity', 'Places', 'Objects', 'Symbols', 'Flags']

class EmojiPicker extends Component {
  state = {
    selectedCategory: 'People'
  }

  renderCategory(category) {
    return (
      <EmojiCategory
        {...this.props}
        category={category}
      />
      )
  }

  renderCategoryOption (category) {
    const style = [
      styles.headerText,
      this.state.selectedCategory === category ? styles.selectedHeaderText : null
    ];

    return (
      <TouchableOpacity
        style={ styles.category }
        key={ category }
        onPress={ () => this.setState({ selectedCategory: category }) }>
        <Text style={ style }>{ category }</Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <View style={ styles.categories }>
          { CATEGORIES.map(this.renderCategoryOption.bind(this)) }
        </View>
        <ScrollView horizontal>
          { this.renderCategory(this.state.selectedCategory) }
        </ScrollView>
      </View>
    )
  }

}

class EmojiCategory extends Component {

  render() {
    let emojis = emojisByCategory[this.props.category]
    let size = this.props.emojiSize || defaultEmojiSize
    let style = {
      fontSize: size-4,
      color: 'black',
      height: size+4,
      width: size+4,
      textAlign: 'center',
      padding: padding,
    }

    return (
      <View style={styles.categoryInner}>
        {emojis.map(e =>
          <Text style={style} 
            key={e} 
            onPress={() => this.props.onEmojiSelected(e)}>
            {e}
          </Text>
        )}
      </View>    
    )
  }
}

const EmojiOverlay = props => (
  <View style={[styles.absolute, props.visible ? styles.visible : styles.hidden]}>
    <TouchableOpacity style={styles.absolute} onPress={props.onTapOutside}>
      <View style={styles.background} />
    </TouchableOpacity>
    {props.visible ? <EmojiPicker {...props}/> : null}
  </View>
)

let styles = StyleSheet.create({
  container: {
    padding: padding,
    flexDirection: 'row'
  },
  absolute: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  visible: {
    top: 0,
    flex: 1,
    justifyContent: 'center',
  },
  hidden: {
    top: 1000,
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: 'grey',
    opacity: 0.5,
  },
  categoryInner: {
    flex: 1,
    flexWrap: 'wrap'
  },
  categories: {
    width: 80
  },
  category: {
    flex: 1,
    justifyContent: 'center'
  },
  headerText: {
    padding: padding,
    color: '#432B52'
  },
  selectedHeaderText: {
    color: '#432B52',
    fontWeight: 'bold'
  }
})

EmojiPicker.propTypes = {
  onEmojiSelected: PropTypes.func.isRequired,
}

export { EmojiPicker as default, EmojiOverlay as EmojiOverlay }