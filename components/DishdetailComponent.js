import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList ,StyleSheet, Modal, Button } from 'react-native';
import { Card, Icon,Rating, Input} from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite ,postComment} from '../redux/ActionCreators';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment:(dishId, author, rating , comment)=>dispatch(postComment(dishId, author, rating , comment))
})

function RenderDish(props) {

    const dish = props.dish;
    
        if (dish != null) {
            return(
                <Card
                featuredTitle={dish.name}
                image={{ uri: baseUrl + dish.image}}>
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
        <Card title = "Comments">
            <FlatList
                data = { comments }
                renderItem = { renderCommentItem }
                keyExtractor = { item => item.id.toString()}
                />
        </Card>
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
        this.props.postComment(dishId, this.state.rating, this.state.comment, this.state.author);
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