import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ClientIdGuide({ children }: React.PropsWithChildren) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>获取 Client ID</DialogTitle>
          <DialogDescription>
            <code className="font-mono">__client_id</code>{" "}
            是洛谷分配给您浏览器的编号，与当前账号的登录状态关联。我们需要获取您的
            Client ID 以代表您操作洛谷上的数据。
          </DialogDescription>
          <Tabs>
            <TabsList className="my-4 grid w-full grid-cols-3">
              <TabsTrigger value="chrome">Google Chrome</TabsTrigger>
              <TabsTrigger value="edge">Microsoft Edge</TabsTrigger>
              <TabsTrigger value="firefox">Firefox</TabsTrigger>
            </TabsList>
            <div>
              请参阅{" "}
              <TabsContent value="chrome" asChild>
                <a
                  className="underline-offset-2 hover:underline"
                  href="https://developer.chrome.com/docs/devtools/application/cookies"
                >
                  Chrome DevTools 文档
                </a>
              </TabsContent>
              <TabsContent value="edge" asChild>
                <a
                  className="underline-offset-2 hover:underline"
                  href="https://support.microsoft.com/zh-cn/microsoft-edge/%E5%9C%A8-microsoft-edge-%E4%B8%AD%E6%9F%A5%E7%9C%8B-cookie-a7d95376-f2cd-8e4a-25dc-1de753474879"
                  hrefLang="zh-CN"
                >
                  Microsoft 支持
                </a>
              </TabsContent>
              <TabsContent value="firefox" asChild>
                <a
                  className="underline-offset-2 hover:underline"
                  href="https://firefox-source-docs.mozilla.org/devtools-user/storage_inspector/"
                  hrefLang="en"
                >
                  Storage Inspector 文档
                </a>
              </TabsContent>
              。
            </div>
          </Tabs>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
