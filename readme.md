# Logs Viewer

our app downloads logs everytime a call ends

but sometimes the logs overlap making hard the analisys

## Architecture

### Structure

Progressive web app, must do all the processing locally

### Architecture characteristics

must be performant,  must be cheap to host

### Architecture desisions

1. reactjs
2. do all the processing locally
3. create web workes if processing is slowing down app
4. log files should not be mutated
5. Business logic resides on the domain files
6. domain files can't depend on react
7. domain files are stateless

### Design principles

- test all domain files
- test react files only if strictly necessary

## features

- Open Multiple log files at the same time
- Parse line date and groups them
- Combines and sorts lines from all files

- Filter lines
- Open and save .tat files
- Name your project

Open multiple files.
~~- identify log lines, including lines without dates (attach those lines to the latest line with date)~~
~~- de dupe identical lines in different files.~~
~~- display all lines in date order~~
~~- sort lines by date~~
~~- similar filtering to the .net filtering. (add filters, color lines,)~~

## BUGs

- resize can hide toolbar completely

## missing features

- filter by date
- scenario searcher
- filters:
  - count hits independetly of other filters
  - navigate to next - previous hit
- timeline, see a time representation, with hability to highlight some times
- notes: write notes of what some line means and see them floating or something

## missing features vs TAT

--none!
