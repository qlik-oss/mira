#! /usr/bin/python

from subprocess import check_output
from contextlib import contextmanager
import sys
import re
import os


class InputCfg:
    """
    InputCfg - a class to persist the script state during exection
    """
    def __init__(self):
        self.option = ""
        self.searchstr = ""
        self.workingdir = ""
        self.match = False
        self.errmsg = ""


def check_args():
    """
    check_args - Validate script input arguments.

    This function will validate inputs for:
        - the correct number of args
        - a valid option
        - in the case of a regular expression, it must compile
    When one of the above tests fail, a Usage block is displayed on the
    command line and the script exit with error level 1.

    :return: void
    """
    usage = """
            Inspect the most recent git commit to see if there was a change of interest. When there is match, the
            script returns "True", "False" for no match found. Run this script from the desired git project root.
            
            Usage: check_git <option> <"searchstr"> [repodir]
            
            Where:
            
                option, how the committed file list should be evaluated:
                    -s : starts with
                    -e : ends with
                    -c : contains
                    -x : exact match
                    -r : regular expression
                    
                searchstr: a quoted string pattern to match, or regular expression
                
                repodir: optional full path to repository. If omitted, current working directory is used
            """

    numargs = len(sys.argv)
    if numargs == 3 or numargs == 4:
        # initialize user input in script level config
        input_cfg.option = sys.argv[1]
        input_cfg.searchstr = sys.argv[2]
        if numargs == 4:
            input_cfg.workingdir = sys.argv[3]

        # validate options and regular expression syntax
        check_option()
        check_regex()
        check_repo_dir()
    else:
        input_cfg.errmsg = "wrong number of arguments: " + str(len(sys.argv))

    if input_cfg.errmsg != "":
        print usage
        sys.exit(sys.argv[0] + ": " + input_cfg.errmsg)


@contextmanager
def cd(newdir):
    """
    cd - change current working directory

    Temporarily change the current working directory in a with statement block and switch back to previous
    directory when finished. For more details see:
        o contextmanager - https://docs.python.org/2/library/contextlib.html#contextlib.contextmanager
        o Generators - https://wiki.python.org/moin/Generators
        o The with statement - https://docs.python.org/3/reference/compound_stmts.html#the-with-statement

    :param newdir: the directory to change to

    :return: void
    """
    prevdir = os.getcwd()
    os.chdir(os.path.expanduser(newdir))
    try:
        yield
    finally:
        os.chdir(prevdir)


def check_option():
    """
    check_option - Validates that the option set in the input_cfg.
    When it is not know the input_cfg errmsg is initialized.

    :return: void
    """
    if input_cfg.option != "-s" and \
            input_cfg.option != "-e" and \
            input_cfg.option != "-c" and \
            input_cfg.option != "-x" and \
            input_cfg.option != "-r":
        input_cfg.errmsg = "illegal option: " + input_cfg.option


def check_regex():
    """
    check_regex - When the input_cfg option is "-r" this function validates that the input regular
    expression will compile. If the compile fails, the input_cfg errmsg is initialized.

    :return: void
    """
    if input_cfg.option == "-r":
        try:
            re.compile(input_cfg.searchstr)
        except re.error:
            input_cfg.errmsg = "bad regular expression"


def check_repo_dir():
    """
    check_repo_dir - validates the optional repo directory exists. If it doesn't, input_cfg errmsg is initialized

    :return: void
    """
    if input_cfg.workingdir != "" and os.path.isdir(input_cfg.workingdir) is not True:
        input_cfg.errmsg = "repo directory does not exist: " + input_cfg.workingdir


def is_match(test_str):
    """
    is_match - Checks if the input test_str satisfies the user provided search string and option.

    :param test_str: The string to compare against, which is a line from the git whatchanged output.

    :return: True if the search string argument matches the input test string, when applying the user requested option.
    """
    if input_cfg.option == "-s":

        return test_str.startswith(input_cfg.searchstr)

    elif input_cfg.option == "-e":

        return test_str.endswith(input_cfg.searchstr)

    elif input_cfg.option == "-r":

        return re.search(input_cfg.searchstr, test_str)

    elif input_cfg.option == "-x":

        return test_str == input_cfg.searchstr

    elif input_cfg.option == "-c":

        if input_cfg.searchstr in test_str:
            return True

    return False


def run_git_check():
    """
    run_git_check - Obtain the list of files that have changed in the most recent commit. For each entry, test
    against the user supplied arguments. If a match is found it's stored in the input_cfg.

    :return: void
    """
    commit_sha = check_output(["git", "rev-parse", "HEAD"])
    # print commit_sha
    commit_sha = commit_sha.rstrip("\n")
    raw_changed = check_output(["git", "whatchanged", commit_sha, "-n", "1"])
    # print raw_changed
    changed_lines = raw_changed.split("\n")
    # print changed_lines
    for line in changed_lines:
        if line.startswith(":"):
            cols = line.split(" ")
            last_col = len(cols) - 1
            pathname = cols[last_col].lstrip("M\t")

            if is_match(pathname):
                input_cfg.match = True
                break

            #print pathname


# initialize the object to track script state
input_cfg = InputCfg()

# validate user input
check_args()

# run the test to check for file(s) changed
if input_cfg.workingdir == "":
    # runs in current working directory
    run_git_check()
else:
    # runs in user provided directory
    with cd(input_cfg.workingdir):
        run_git_check()

# output the results to the user
print input_cfg.match
