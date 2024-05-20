import { gql } from "@/__generated__";
import { TPostCard } from "@/components/Card2/Card2";
import { updatePostsNcmazMetaDataOk } from "@/stores/postsNcmazMetaDataOk/postsNcmazMetaDataOkSlice";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

interface Props {
  posts?: TPostCard[];
}

export default function useGetPostsNcmazMetaByIds(props: Props) {
  const [refetchTimes, setRefetchTimes] = useState(0);

  const dispatch = useDispatch();

  let IDS = props.posts?.map((post) => post.databaseId.toString());

  const DOM_ID_LOADING = IDS?.length
    ? "getPostsNcmazMetaByIds_loading_" + IDS.join("_")
    : null;

  const { data, loading, error, called, refetch } = useQuery(
    gql(/* GraphQL */ `
      query QueryGetPostsNcmazMetadataByIds(
        $in: [ID] = null
        $first: Int = 100
        $after: String = null
      ) {
        posts(first: $first, after: $after, where: { in: $in }) {
          nodes {
            databaseId
            commentCount
            ncPostMetaData {
              ...NcmazFcPostMetaFullFields
            }
          }
        }
      }
    `),
    {
      variables: {
        in: IDS,
      },
      skip: !IDS?.length,
      notifyOnNetworkStatusChange: true,
      context: {
        fetchOptions: {
          method: process.env.NEXT_PUBLIC_SITE_API_METHOD || "GET",
        },
      },
      fetchPolicy: "cache-and-network",
      onCompleted: (data) => {
        // @ts-ignore
        dispatch(updatePostsNcmazMetaDataOk(data?.posts?.nodes || []));
      },
      onError: (error) => {
        if (refetchTimes > 3) {
          return;
        }
        setRefetchTimes(refetchTimes + 1);
        refetch();
      },
    }
  );

  useEffect(() => {
    if (typeof window === "undefined" || !DOM_ID_LOADING) {
      return;
    }

    if (!loading) {
      const loadingDom = document.getElementById(DOM_ID_LOADING);
      if (loadingDom) {
        document.body.removeChild(loadingDom);
      }
      return;
    }

    // tao 1 DOM node de button like action co the dua vao do ma xac dinh la co dang loading hay khong.
    const likeActionNode = document.createElement("div");
    likeActionNode.id = DOM_ID_LOADING;
    likeActionNode.classList.add("getPostsNcmazMetaByIds_is_loading");
    document.body.appendChild(likeActionNode);

    return () => {
      document.body.removeChild(likeActionNode);
    };
  }, [loading]);

  return {
    loading,
    data,
    error,
    called,
  };
}
