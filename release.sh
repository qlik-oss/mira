#!/bin/bash

set -e
REPO=qlikcore/mira

function print_usage {
  echo "Usage:"
  echo "  RELEASE_TYPE=patch release.sh"
  echo "  release.sh (-?, -h, --help)"
  echo
  echo "Options:"
  echo "  -?, -h, --help  - Prints this usage information."
  echo
  echo "Environment variables:"
  echo "  - RELEASE_TYPE - Required. Set to patch, minor or major."
  echo
  echo "If RELEASE_TYPE is major, or minor, the released version will be the bumped version"
  echo "and development continues on the next patch version."
  echo
  echo "If RELEASE_TYPE is patch, the pre-release version of package.json is used."
  echo "After that the patch number is bumped."
}

if [[ $1 == "-?" || $1 == "-h" || $1 == "--help" ]]; then
  print_usage
  exit 0
fi

function pre_flight_checks() {
  if [[ ! -z $(git status --porcelain) ]]; then
    echo "There are uncommitted changes. Please make sure branch is clean."
    exit 1
  fi
}

function check_release_type() {
  if [ "$RELEASE_TYPE" != patch ] && [ "$RELEASE_TYPE" != minor ] && [ "$RELEASE_TYPE" != major ]; then
    echo "Invalid RELEASE_TYPE specified"
    print_usage
    exit 1
  fi
}

## Now do the thing
pre_flight_checks
check_release_type

if [ -f package.json ]; then
  VERSION=$(node -e "console.log(require('./package.json').version)")
  USING_NPM=true
elif [ -f version.txt ]; then
  VERSION=$(cat version.txt)
  USING_VERSIONFILE=true
elif [ -f Makefile ]; then
  # Figure out if we have a target to make version.txt
  if (make -qp | awk -F':' '/^[a-zA-Z0-9][^$#\/\t=]*:([^=]|$)/ {split($1,A,/ /);for(i in A)print A[i]}' | sort -u | grep version.txt &>/dev/null); then
    make version.txt
    VERSION=$(cat version.txt)
    USING_VERSIONLESS=true
  fi
fi

if [ -z "$VERSION" ]; then
  echo "Unable to determine current version."
  echo "You need either a package.json or a version.txt (or a 'version.txt' Makefile target)."
  exit 1
fi

# Figure out current release without prerelease
VERSION_NOPRERELEASE=$(echo $VERSION | sed -E 's/-[0-9A-Za-z.-]+$//' )

# Split by period into an array
RELEASE_PARTS=( ${VERSION_NOPRERELEASE//./ } )

# For major and minor releases increment by 1 and set following positions to 0
case "$RELEASE_TYPE" in
  major) (( RELEASE_PARTS[0] += 1))
          RELEASE_PARTS[1]=0
          RELEASE_PARTS[2]=0
      ;;
  minor) (( RELEASE_PARTS[1] += 1))
          RELEASE_PARTS[2]=0
      ;;
esac
RELEASE_VERSION="${RELEASE_PARTS[0]}.${RELEASE_PARTS[1]}.${RELEASE_PARTS[2]}"
echo "Current version is: ${VERSION}, releasing ${RELEASE_VERSION}"

# If the current version is a pre-release, bump it to a release first.
if (echo $VERSION | egrep -- '-[0-9A-Za-z.-]+$' 1> /dev/null ); then
  if [ -n "$USING_NPM" ]; then
    npm version $RELEASE_TYPE -m "Releasing v%s"
  else
    git commit --allow-empty -m "Releasing v${RELEASE_VERSION}"
    git tag -a v${RELEASE_VERSION} -m "Releasing v${RELEASE_VERSION}"
  fi
  git push
  git push --tags
else
  git tag -a v$VERSION -m "Releasing v$VERSION"
  git push
  git push --tags
fi

if [ -n "$USING_NPM" ]; then
  NEWVER=$(npm version prerelease -m "Beginning development on v%s [ci skip]")
  echo "Beginning development on next version (${NEWVER})..."
  git tag -d $NEWVER
  git push
elif [ -n "$USING_VERSIONFILE" ]; then
  # Increment the patch-level number
  (( RELEASE_PARTS[2] += 1 ))
  NEWVER="${RELEASE_PARTS[0]}.${RELEASE_PARTS[1]}.${RELEASE_PARTS[2]}-0"
  echo $NEWVER > version.txt
  echo "Beginning development on next version (${NEWVER})..."
  git add version.txt
  git commit -m "Beginning development on v${NEWVER} [ci skip]"
  git push
fi

echo "Done."
