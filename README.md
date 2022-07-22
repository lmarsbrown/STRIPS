# STRIPS

This is an extended implementation of the Stanford Research Institute Problem Solver (STRIPS), an automated planning algorithim. STRIPS can be used to solve a wide variety of problems ranging from navigating a room to solving a rubiks cube. 

## Overview

This is a general description of the way the STRIPS proccesses information and how to think in terms of STRIPS. If you are already familiar with this algorithm, feel free to skip this section.

If you are writing a program to solve a problem, the first step is to convert the problem to a form that is understandable to a computer. Let's first look at how STRIPS describes problems. STRIPS describes problems in terms of states and actions. A state is a collection of all of the information relevant to a problem at a given step. For example, in the rubiks cube case, the state of the rubiks cube is the color of all of its squares. In this implementation of STRIPS, the state is an arbitrary object that is created by the user. The actions are all of the things that can be done to change the state. In the rubiks cube example, the actions are all of ways you can rotate each face of the rubiks cube. These actions can be applied to the state, modifying it. For example, an action such as 'Move top face counterclockwise' could be applied to a cube, rotating all of the squares on the top section of the cube counterclockwise 90 degrees. The actions should also contain information on the cases that they are valid. This doesn't apply in the rubiks cube example as you are always allowed to do every move, but for other problems, this is not the case. For example, the puzzle [Towers of hanoi](https://en.wikipedia.org/wiki/Tower_of_Hanoi) has restriction as to when moves are allowed. The puzzle involves moving rings around between pegs, and one of the main rules is that a a ring cannot be placed above another ring smaller than itself. This is an example of a case where actions can only be taken in certain circumstances. In this implementation, each action contains a function which takes a state as a parameter and returns a copy of the state that has been modified by the action, as well as a function that takes a state as a parameter and returns whether or not the given action can be performed.

The job of STRIPS is to take an initial state, a goal state, and a list of actions, and determine an efficient sequence of actions that will transform the initial state to the goal state. In the rubiks cube example, you would provide a scrambled rubiks cube as the initial state, a solved rubiks cube as the goal state, and the moves you can do on the rubiks cube as the actions. STRIPS would then return a list of the moves that you need to do to solve the rubiks cube.

## Guide

This is a guide to using to using this library.

### The state

The first thing that you need to do when using this library is figure out how to 


