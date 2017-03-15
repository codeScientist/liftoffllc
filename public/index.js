import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {Bar} from 'react-chartjs-2';
import data from './data.json';

class RadioOption extends React.Component {
  render() {
    var classNames = ['radioOption'];

    if (this.props.isChecked) {
      classNames.push('selected');
    }

    return (
      <li>
        <input 
          type="radio" 
          value={this.props.value} 
          name={this.props.name} 
          className={classNames.join(' ')} 
          onChange={this.props.onAnswerChange}
          checked={this.props.isChecked}
        />
        {this.props.value} 
      </li>
    );
  }
}

class InputOption extends React.Component {
  render() {
    return (
      <div>
        <input 
          type="text" 
          value={this.props.value} 
          name={this.props.name} 
          className="form-control inputOption" 
          onChange={this.props.onAnswerChange}
        />
      </div>
    );
  }
}

class OptionList extends React.Component {
  render() {

    var name = "question-" + this.props.index;

    if (!this.props.options || this.props.options.length === 0) {
      return (
        <div className="answer">
          <InputOption 
            name={name} 
            value={this.props.userAnswer} 
            onAnswerChange={this.props.onAnswerChange} 
          />
        </div>
      );
    }

    var tempThis = this;

    var optionList = this.props.options.map(function(option, index){
      return (
        <RadioOption 
          name={name} 
          key={index} 
          value={option}
          onAnswerChange={tempThis.props.onAnswerChange} 
          isChecked={option === tempThis.props.userAnswer}
        />
      );
    });
    return (
      <div className="answer">
        <ul className="radioOptionList">
          {optionList}
        </ul>
      </div>
    );
  }
}

class Question extends React.Component {
  render() {
    var classNames = ['question'];

    if (this.props.validationError && this.props.userAnswer === '') {
      classNames.push("invalid");
    }

    if (this.props.isSubmitted && this.props.userAnswer !== this.props.correctAnswer) {
      classNames.push("incorrect");
    }

    return (
      <div className={classNames.join(' ')}>
        <div className="question-text">{"Q" + (this.props.index + 1) + ": " + this.props.question}</div>
        <OptionList 
          options={this.props.options} 
          index={this.props.index} 
          onAnswerChange={this.props.onAnswerChange}
          userAnswer={this.props.userAnswer}
        />
      </div>
    );
  }
}

class QuestionList extends React.Component {
  render() {
    if (this.props.questions.length === 0) {
      return (
        <div>No Questions!!</div>
      );
    }

    var tempThis = this;

    var questionList = this.props.questions.map(function(q, index) {
      return (
        <Question 
          key={index} 
          index={index} 
          question={q.question} 
          options={q.options} 
          onAnswerChange={tempThis.props.onAnswerChange}
          userAnswer={q.userAnswer}
          validationError={tempThis.props.validationError}
          isSubmitted={tempThis.props.isSubmitted}
          correctAnswer={q.answer}
        />
      );
    });

    return (
      <div className={"questionList"}>
        {questionList}
      </div>
    );
  }
}

class Questionnaire extends React.Component {
  constructor() {
    super();

    this.state={
      questions: [],
      validationError: false,
      isSubmitted: false
    };

    this.onAnswerChange = this.onAnswerChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onClear = this.onClear.bind(this);
  }

  componentWillMount() {
    var qs = _.clone(data);
    qs.forEach(function(q){
      q.userAnswer = '';
    });
    this.setState({
      questions: qs
    });
  }

  onAnswerChange(e) {
    var index = Number(e.target.name.split("-")[1]);
    var qs = _.clone(this.state.questions);
    qs[index].userAnswer = e.target.value;
    this.setState({
      questions: qs,
      validationError: false,
      isSubmitted: false
    });
  }

  onSubmit(e) {
    e.preventDefault();

    var validationErr = this.state.questions.every(function(q){
      return q.userAnswer !== '';
    });

    if (!validationErr) {
      this.setState({
        validationError: true
      });
      return;
    }

    this.setState({
      isSubmitted: true
    });
  }

  onClear(e) {
    var qs = _.clone(this.state.questions);
    qs.forEach(function(q){
      q.userAnswer = '';
    });
    this.setState({
      questions: qs,
      validationError: false,
      isSubmitted: false
    });
  }

  render() {
    var validationError;
    if (this.state.validationError) {
      validationError = (
        <div className="validationError">
          One or more Questions are un-answered
        </div>
      );
    }

    var chart;
    if (this.state.isSubmitted) {
      var incorrect = 0;
      var correct = 0;
      this.state.questions.forEach(function(q){
        if (q.userAnswer.toLowerCase() === q.answer) {
          correct++;
        } else {
          incorrect++;
        }
      });

      console.log("dbg1: ", correct);
      console.log("dbg2: ", incorrect);

      var data = {
        labels: ['# of Questions'],
        datasets: [
          {
            label: 'correct',
            data: [correct],
            backgroundColor: ["#2ecc71"]
          },
          {
            label: 'incorrect',
            data: [incorrect],
            backgroundColor: ["#e23434"]
          }
        ]
      };

      chart = (
          <Bar
              data={data}
              height={400}
              options={{
                scales: {
                    yAxes: [{
                        ticks: {
                            max: this.state.questions.length + 1,
                            min: 0,
                            stepSize: 1
                        }
                    }]
                },
                title: {
                  display: true,
                  text: 'correct vs incorrect'
                }
              }}
          />
      );
    }

    return (
      <div>
        <h1>Questionnaire</h1>
        <form onSubmit={this.onSubmit}>
          <QuestionList 
            questions={this.state.questions} 
            onAnswerChange={this.onAnswerChange} 
            validationError={this.state.validationError}
            isSubmitted={this.state.isSubmitted}
          />
          {validationError}
          <input className="btn btn-default submit-btn" type="submit" value="Submit" />
          <input className="btn btn-default clear-btn" type="button" value="Clear all" onClick={this.onClear} />
        </form>
        {chart}
      </div>
    );
  }
}

ReactDOM.render(
  <Questionnaire />,
  document.getElementById('container')
);
