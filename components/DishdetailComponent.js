import React, { Component } from 'react';
import { Card, Icon,Rating, Input} from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite ,postComment} from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder } from 'react-native';
const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment:(dishId, rating, author, comment)=>dispatch(postComment(dishId, rating, author, comment))
})

function RenderDish(props) {
    handleViewRef = ref => this.view = ref;
    const dish = props.dish;
    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
    }
    const recognizeDragLeft = ({moveX, moveY, dx, dy}) => {
        if(dx > 200)
            return true;
        else
            return false;
    }
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );
            if(recognizeDragLeft(gestureState))
            props.onSelect();
            return true;
        },
        onPanResponderGrant: () => {this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));},
    })

        if (dish != null) {
            return(
                <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
                ref={this.handleViewRef}
                {...panResponder.panHandlers}>
                <Card
                featuredTitle={dish.name}
                image={{uri: baseUrl + dish.image}}>
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={styles.buttonrow}>
                        <Icon
                        
                        raised
                        reverse
                        name = { props.favorite ? 'heart' : 'heart-o' }
                        type = 'font-awesome'
                        color = '#f50'
                        onPress = {() => props.favorite ? console.log('Already favorite') : props.onPress()}
                        />
                        <Icon
                        
                        raised
                        reverse
                        name = 'pencil'
                        type = 'font-awesome'
                        color = '#512DA8'
                        onPress = {() => {props.onSelect()}}
                        />
                        
                        </View>
                </Card>
                </Animatable.View>
            );
        }
        else {
            return(<View></View>);
        }
}

function RenderComments(props) {
    const comments = props.comments;

    const renderCommentItem = ({ item, index }) => {
        return(
            <View key = {index} style = {{margin: 10}}>
                <Text style = {{fontSize: 14}}>
                    {item.comment}
                </Text>
                <Text style = {{fontSize: 12}}>
                <Rating imageSize={20} readonly startingValue={item.rating} />;
                </Text>
                <Text style = {{fontSize: 12}}>
                    {'-- ' + item.author + ', ' + item.date}
                </Text>
            </View>
        );
    }

    return(
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>        
        <Card title='Comments' >
            <FlatList 
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
                />
        </Card>
        </Animatable.View>
    );
}

class DishDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            favorites: [],
            showModal:false,
            rating:0,
            author:'',
            comment:'',
        };
    }
    handleComments(dishId){
        this.props.postComment(dishId, this.state.rating, this.state.author, this.state.comment);
        this.setState({
            rating:0,
            author:'',
            comment:'',
        })
        this.closeModal();
    }
    toggleModal(){
        //this.setState({showModal: !(this.state.showModal)});
        console.log(this.state.showModal);
    }
    openModal(){
        this.setState({showModal: true});
        console.log(this.state.showModal);
    }
    closeModal(){
        this.setState({showModal: false});
        console.log(this.state.showModal);
    }
    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    render() {
        const dishId = this.props.navigation.getParam('dishId','');
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress = {() => this.markFavorite(dishId)}
                    onSelect = {() => this.openModal()}
                    />
                <RenderComments comments = {this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal animation = {"slide"} transparent = {false}
                        visible = {this.state.showModal}
                        onDismiss = {() => this.closeModal()}
                        onRequestClose = {() => this.closeModal}>
                    <View style = {styles.modal}>
                        <View>
                            <Rating showRating
                                    type = "star"
                                    fractions = {0}
                                    startingValue = {0}
                                    imageSize = {40}
                                    onFinishRating = {(rating) => this.setState({rating: rating})}
                                    />
                        </View>
                        <View>
                            <Input
                            placeholder='Author'
                            leftIcon={
                                <Icon
                                name='user-o'
                                type = 'font-awesome'
                                size={24}
                                />
                            }
                            onChangeText = {(value) => this.setState({author: value})}
                            />
                        </View>
                        <View>
                            <Input
                                placeholder = "Comment"
                                leftIcon = {
                                    <Icon
                                    name = 'comment-o'
                                    type = 'font-awesome'
                                    size = {24}
                                    />
                                }
                                onChangeText = {(value) => this.setState({comment: value})}
                            />
                        </View>
                        <View>
                            <Button color = "#512DA8"
                                    title = "SUBMIT"
                                    onPress = {() => this.handleComments(dishId)}
                                    />
                        </View>
                        <View>
                            <Button onPress = {() => this.closeModal()}
                                    color = "#989898"
                                    title = "CLOSE"
                                    />
                        </View> 
                    </View>       
                </Modal>
            </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    buttonrow: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft:'auto',
      marginRight:'auto',
    },modal: {
        justifyContent: 'center',
        margin: 40
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20
    },
    modalText: {
        fontSize: 18,
        margin: 10
    }
})
export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);