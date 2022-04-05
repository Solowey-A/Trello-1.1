import React, {useEffect, useRef, useState} from "react";
import axios from "axios";

import './App.scss';
import Header from "./components/Header/Header";
import List from "./components/List/List";

function App() {

    const [lists, setLists] = useState();
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        axios
            .get('http://localhost:3001/lists?_embed=cards')
            .then(({ data }) => {
                setLists(data);
            });
    }, []);

    const onAddList = (obj) => {
        const newList = [...lists, obj];
        setLists(newList);
    };

    const onRemoveList = (id) => {
        const newLists = lists.filter(item => item.id !== id)
        setLists(newLists)
    }

    const onEditListTitle = (listId, listTitle) => {
        const newList = lists.map(list => {
            if (list.id === listId) {
                list.name = listTitle;
            }
            return list;
        })

        setLists(newList);
    }

    const onAddCard = (listId, taskObj) => {

        const newList = lists.map(item => {
            if (item.id === listId) {
                item.cards = [...item.cards, taskObj];
            }
            return item;
        })

        setLists(newList);
    };

    const onRemoveCard = (listId, cardId) => {
        if (!window.confirm('Do you really want to remove this item ?')) {
            return;
        }
        const newList = lists.map(list => {
            if (list.id === listId) {
                list.cards = list.cards.filter(task => task.id !== cardId)
            }
            return list;
        })
        setLists(newList);
        axios.delete('http://localhost:3001/cards/' + cardId).catch(() => {
            alert('ERROR')
        })
    }

    const onEditCard = (listId, taskObj) => {
        const newCardText = window.prompt('Edit', taskObj.text);

        if (!newCardText) {
            return;
        }

        const newList = lists.map(list => {
            if (list.id === listId) {
                list.cards = list.cards.map(card => {
                    if (card.id === taskObj.id) {
                        card.text = newCardText;
                    }
                    return card;
                });
            }
            return list;
        });
        setLists(newList);
        axios
            .patch('http://localhost:3001/cards/' + taskObj.id, {
                text: newCardText
            })
            .catch(() => {
                alert('ERROR');
            });
    };

    const onEditCardTitle = (listId, taskObj) => {
        const newCardTitle = window.prompt('Edit', taskObj.text);

        if (!newCardTitle) {
            return;
        }

        const newList = lists.map(list => {
            if (list.id === listId) {
                list.cards = list.cards.map(card => {
                    if (card.id === taskObj.id) {
                        card.title = newCardTitle;
                    }
                    return card;
                });
            }
            return list;
        });
        setLists(newList);
        axios
            .patch('http://localhost:3001/cards/' + taskObj.id, {
                title: newCardTitle
            })
            .catch(() => {
                alert('ERROR');
            });
    };

    const onChangeDeadline = (listId, taskObj) => {

        const newList = lists.map(list => {
            if (list.id === listId) {
                list.cards = list.cards.map(card => {
                    if (card.id === taskObj.id) {
                        card.color = taskObj.color;
                    }
                    return card;
                });
            }
            return list;
        });
        setLists(newList);
        axios
            .patch('http://localhost:3001/cards/' + taskObj.id, {
                color: taskObj.color
            })
            .catch(() => {
                alert('ERROR');
            });
    }

    const dragItem = useRef();
    const dragNode = useRef();

    const handleDragStart = (e, params) => {
        // console.log('Starting to drag', params)
        dragNode.current = e.target;
        dragNode.current.addEventListener('dragend', handleDragEnd)
        dragItem.current = params;



        setTimeout(() => {
            setDragging(true)
        },0)

    }

    const handleDragEnter = (e, targetItem) => {
        // console.log('Entering drag', targetItem);

        const currentItem = dragItem.current;

        if(e.target !== dragNode.current) {
            setLists(oldList => {
                let newList = JSON.parse(JSON.stringify(oldList))
                newList[targetItem.listIndex].cards.splice(targetItem.cardIndex, 0, newList[dragItem.current.listIndex].cards.splice(dragItem.current.cardIndex,1)[0])
                dragItem.current = targetItem;
                return newList
            })
        }
    }

    const handleDragEnd = () => {
        // console.log('ending drag');
        setDragging(false);
        dragNode.current.removeEventListener('dragend', handleDragEnd);
        dragItem.current = null;
        dragNode.current = null;
    }

    const getStyles = (params2) => {

        const currentItem = dragItem.current

        if (currentItem.listIndex === params2.listIndex && currentItem.cardIndex === params2.cardIndex) {
            return 'trello-list-item dragging'
        }
        return 'trello-list-item'

    }
    return (
        <div className="App" id="app">
            <Header/>
            <div className="page-container">

                {lists ? (
                    <List
                        lists={lists} onAdd={onAddList}
                        onRemoveList={onRemoveList}
                        onEditListTitle={onEditListTitle}
                        onAddCard={onAddCard}
                        onRemoveCard={onRemoveCard}
                        onEditCard={onEditCard}
                        onEditCardTitle={onEditCardTitle}
                        handleDragStart={handleDragStart}
                        handleDragEnter={handleDragEnter}
                        onChangeDeadline={onChangeDeadline}
                        dragging={dragging}
                        getStyles={getStyles}
                    />
                    ) : (
                    'Loading...'
                )}
            </div>
        </div>
    );
}

export default App;
