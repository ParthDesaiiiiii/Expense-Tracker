import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { error: null, info: null } }
  componentDidCatch(error, info){
    console.error('ErrorBoundary caught', error, info)
    this.setState({ error, info })
  }
  render(){
    if (this.state.error) {
      return (
        <div style={{padding:24,fontFamily:'Inter',color:'#111',background:'#fff',minHeight:'100vh'}}>
          <h2 style={{color:'#b91c1c'}}>Something went wrong</h2>
          <div style={{whiteSpace:'pre-wrap',background:'#f3f4f6',padding:12,borderRadius:8}}>
            {String(this.state.error && this.state.error.toString())}
            <br/>
            {this.state.info && this.state.info.componentStack}
          </div>
          <div style={{marginTop:12}}>
            <button onClick={() => location.reload()} style={{padding:8,borderRadius:8}}>Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
