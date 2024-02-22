import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from "./Chatbox.css";
import logo from "../assets/download.png";

function ChatBox() {
    const [userInput, setUserInput] = useState('');
    const [chatHistory,setChatHistory] = useState([]);
    const [loading,setLoading] = useState(false);
    let citation = [];
    let citationtemp;
    // let tempObject = {
    //    users:[{user1:"chaitanya"},{user2:"kunnu"},{user3:"baseed"}],
    //    count:3,
    //    address:{
    //     hno:"111/2",
    //     street:'miyapur',
    //     city:'Hyderabad'
    //    }
    // }
    
    const sendMessage = async () => {
        if(userInput.trim() === '') return;

        try {
            setUserInput('');
            setLoading(true);
            setChatHistory(prevHistory =>[
                ...prevHistory,
                {role:'user',content:userInput}
            ]);
            const response = await axios.post('http://localhost:85/api/temp/jiraExtract/retrieveProjectDetails',{
                "dataSources": [
                    {
                        "type": "AzureCognitiveSearch",
                        "parameters": {
                            "endpoint": "https://ai-azure-custom-data.search.windows.net",
                            "indexName": "projectid",
                            "semanticConfiguration": "default",
                            "queryType": "vector",
                            "fieldsMapping": {},
                            "inScope": true,
                            "roleInformation": "You are an AI assistant that helps people find information.",
                            "filter": null,
                            "strictness": 3,
                            "topNDocuments": 5,
                            "key": "Wjv8AosqeVpyLE59k9fFvCpGGJJQeBRH00tkk6L3ewAzSeAa1TBC",
                            "embeddingDeploymentName": "ai-custom-embedding"
                        }
                    }
                ],
                "messages": [
                    {role:'user',content:userInput}
                ],
                "deployment": "ai-custom-model",
                "temperature": 0,
                "top_p": 1,
                "max_tokens": 800,
                "stop": null,
                "stream": false
            });
             citationtemp = JSON.parse(response.data.choices[0].message.context.messages[0].content)
            if(citationtemp.citations.length!==0){
                citation = citationtemp.citations
                setChatHistory(prevHistory =>[
                    ...prevHistory,
                   {role:'assistant',content:response.data.choices[0].message.content,citations:citation}
                ]);
            }else{
            setChatHistory(prevHistory =>[
                ...prevHistory,
               {role:'assistant',content:response.data.choices[0].message.content}
            ]);
        }
        } catch(error) {
            console.error('Error Message', error);
        }finally{
            setLoading(false);
        }
    };

    const handleChange = event => {
        setUserInput(event.target.value);
           
    };

    const openPopup = (citation) =>{
        console.log(citation);
        const jsonString = citation;
        const popupwindow = window.open('','_blank','width=600','height=800');
        if(popupwindow){
            popupwindow.document.write('<pre>'+jsonString+'</pre>');
        }
    }

    const clearChat = () =>{
        setChatHistory([]);
    }

    return(
        <div className={styles.container} style={{width:'100%',textAlign:'center'}}>
            <div className='navbar'>
                <img src= {logo} alt='logo' style={{float:'left'}}/>
            </div>
            <div className={styles.chatContainer} style={{position:'relative',border: '1px solid grey',height:'25em',width:'51em',overflowY:'auto',margin:'auto',backgroundColor: '#dbdbdb',borderStyle: 'none',  borderTopRightRadius: '2%',borderTopLeftRadius: '2%'
}}>
    <button className='clear-button' onClick={clearChat} title='Clear Chat' style={{padding:'5px',
    fontSize:'13px',cursor:'pointer'}}>
                <FontAwesomeIcon icon={faTrash} />
            </button>
            {chatHistory.length ===0 && <div><h1>Chat with your data...</h1><p>Ask anything or try an example</p></div>}
                {chatHistory.map((message, index) =>(
                    <div key ={index} className={ `message-container${message.role ==='user'? 'user-message':'bot-message'}`} style={{borderWidth: `${message.content.length}px`}}>
                        <div className={`message${message.role}`}>
                        {message.content}
                        </div>
                        <div>
                        {message.citations && (
                            <div style={{marginTop:'5%',display:'grid',overflow:'auto',padding:'10px'}}>
                                <label>Citation:{message.citations.map((citation,idx)=>{
                                   return <span key={idx} onClick={()=>openPopup(citation.content)} style={{cursor:'pointer',backgroundColor: "white",borderRadius: "5%",width:"fit-content",margin:'2%',padding:'2%'}}>{citation.filepath}</span>
                                })}</label>
                                </div>
                        )}
                        </div>
                    </div>
                ))}
                </div>
                {loading && (
                    <div className='loader-container'>
    <div className='loader'>
        </div>
        </div>
        )}
                <div>
               <input
                className='chatInput'
                type = 'text'
                placeholder=' Type a new question (e.g. projectId,story,task of a particular Project?)'
                value={userInput}
                onChange={handleChange}
                disabled={loading}
                />
                <button style={{padding:'12px',
    fontSize:'15px',cursor:'pointer'}} onClick={sendMessage}> 
                <FontAwesomeIcon style={{color:'cornflowerblue'}} icon={faPaperPlane} title='Ask Question'/>
                </button>
                </div>
                <div className={styles.chatContainer} style={{border: '1px solid grey',height:'1em',width:'51em',overflowY:'auto',margin:'auto',backgroundColor: '#dbdbdb',borderStyle: 'none',borderBottomRightRadius: '10px',borderBottomLeftRadius: '10px'}}>
                </div>
                </div>
            
    );
}

export default ChatBox;