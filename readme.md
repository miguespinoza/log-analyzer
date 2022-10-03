# Logs Viewer

our app downloads logs everytime a call ends

but sometimes the logs overlap making hard the analisys

## features

Load multiple files.
~~- identify log lines, including lines without dates (attach those lines to the latest line with date)~~
~~- de dupe identical lines in different files.~~
~~- display all lines in date order~~
~~- sort lines by date~~
~~- similar filtering to the .net filtering. (add filters, color lines,)~~

## BUGs

- sort by date / file

## missing features vs TAT
-- resize bottom part (filters and files) with mouse
-- filters that hide lines
-- perf improvement, run filters once on all lines and save the color to the line object, lines renderer should not have to do filter comparison again
